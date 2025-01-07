import type { User } from "../types/express.d.ts";
import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
  ReturnValue,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

const SECRET_KEY =
  process.env.SECRET_KEY ||
  "8e0f16e244aeb7b71fa3ab9299db3bc3e465d2b91962a5b4890c86b1da6c7fc1";

const dynamoDb = new DynamoDBClient({
  region: "ap-south-1", // Change to your preferred region
  endpoint: "http://localhost:8000", // Local DynamoDB endpoint
});

const USERS_TABLE = "Users";
const VENDORS_TABLE = "Vendors";

export const signupVendorRequestValidator = (req: Request, res: Response, next: NextFunction): any => {
  let { email, password, name } = req.body;

  email = email?.trim();
  password = password?.trim();
  name = name?.trim();

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Missing required fields: email, password, and name' });
  }

  if (email.length === 0 || password.length === 0 || name.length === 0) {
    return res.status(400).json({ error: 'Fields cannot be empty' });
  }

  next();
}

export const signupVendor = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password, name } = req.body;

    // Check if the user already exists
    const userExists = await findVendorByEmail(email);
    if (userExists) {
      return res.status(400).json({ message: "Vendor already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const newUser = createVendor(email, hashedPassword, name);

    return res
      .status(201)
      .json({ message: "Vendor created successfully", user: newUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

export const loginVendorRequestValidator = (req: Request, res: Response, next: NextFunction): any => {
  let { email, password } = req.body;

  email = email?.trim();
  password = password?.trim();

  if (!email || !password) {
    return res.status(400).json({ error: 'Missing required fields: email and password' });
  }

  if (email.length === 0 || password.length === 0) {
    return res.status(400).json({ error: 'Fields cannot be empty' });
  }

  next();

}


export const loginVendor = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await findVendorByEmail(email);

    if (!user) {
      return res.status(400).json({ message: "Vendor not found" });
    }

    // Check if password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create a JWT token
    const token = jwt.sign({ id: user.id, email }, SECRET_KEY, {
      expiresIn: "1h",
    });

    // Set the token as a cookie
    res.cookie("auth_token", token, {
      // httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      // sameSite: 'lax'
    });

    return res.json({
      message: "Login successful",
      email,
      id: user.id,
      name: user.name,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const signupUserRequestValidator = (req: Request, res: Response, next: NextFunction): any => {
  let { email, password, name } = req.body;

  email = email?.trim();
  password = password?.trim();
  name = name?.trim();

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Missing required fields: email, password, and name' });
  }

  if (email.length === 0 || password.length === 0 || name.length === 0) {
    return res.status(400).json({ error: 'Fields cannot be empty' });
  }

  next();
}

export const loginUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check if password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create a JWT token
    const token = jwt.sign({ id: user.id, email }, SECRET_KEY, {
      expiresIn: "1h",
    });

    // Set the token as a cookie
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    return res.json({
      message: "Login successful",
      email,
      id: user.id,
      name: user.name,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

export const loginUserRequestValidator = (req: Request, res: Response, next: NextFunction): any => {
  let { email, password } = req.body;

  email = email?.trim();
  password = password?.trim();

  if (!email || !password) {
    return res.status(400).json({ error: 'Missing required fields: email and password' });
  }

  if (email.length === 0 || password.length === 0) {
    return res.status(400).json({ error: 'Fields cannot be empty' });
  }

  next();
}

export const logoutUser = async (req: Request, res: Response): Promise<any> => {
  res.clearCookie("auth_token");
  return res.json({ message: "Logged out successfully" });
}

export const signupUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password, name } = req.body;

    // Check if the user already exists
    const userExists = await findUserByEmail(email);
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const newUser = await createUser(email, hashedPassword, name);

    return res
      .status(201)
      .json({ message: "User created successfully", user: { id: newUser.id } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

export const forgotPassword = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email } = req.body;

    // Find the user by email
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Generate a password reset token (JWT or a custom token)
    const resetToken = jwt.sign({ email }, SECRET_KEY, { expiresIn: "15m" });

    // Send the reset token to the user's email (integrate with an email service here?)
    return res.json({
      message: "Password reset token sent",
      resetToken: resetToken,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}


export const resetPassword = async (req: Request, res: Response): Promise<any> => {
  try {
    const { resetToken, newPassword } = req.body;

    // Verify the reset token
    let decoded: any;
    try {
      decoded = jwt.verify(resetToken, SECRET_KEY);
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    // Find the user by email from the token
    const user = await findUserByEmail(decoded.email);
    if (user) {
      // Update user password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const updatedUser = await updateUserPassword(user.id, hashedPassword);
      if (updatedUser) {
        return res.json({
          message: "Password successfully updated for user",
        });
      } else {
        return res
          .status(500)
          .json({ message: "Failed to update user password" });
      }
    }

    // const vendor = await findVendorByEmail(decoded.email);
    // if (vendor) {
    //   // Update vendor password
    //   const updatedVendor = await updateVendorPassword(vendor.id, newPassword);
    //   if (updatedVendor) {
    //     return res.json({ message: "Password successfully updated for vendor" });
    //   } else {
    //     return res.status(500).json({ message: "Failed to update vendor password" });
    //   }
    // }

    return res.status(400).json({ message: "User not found" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Create a new Vendor
export const createVendor = async (
  email: string,
  password: string,
  name: string
): Promise<User> => {
  const newUser: User = {
    id: String(Date.now()), // Use timestamp as ID
    email,
    password,
    name,
  };

  const params = {
    TableName: VENDORS_TABLE,
    Item: marshall(newUser, { removeUndefinedValues: true }),
  };

  await dynamoDb.send(new PutItemCommand(params));
  return newUser;
};

// Find a vendor by email
export const findVendorByEmail = async (
  email: string
): Promise<User | undefined> => {
  const params = {
    TableName: VENDORS_TABLE,
    IndexName: "EmailIndex", // Ensure you create a GSI for email
    KeyConditionExpression: "#email = :email",
    ExpressionAttributeNames: { "#email": "email" },
    ExpressionAttributeValues: marshall({ ":email": email }),
  };

  const result = await dynamoDb.send(new QueryCommand(params));
  return result.Items?.[0] ? (unmarshall(result.Items[0]) as User) : undefined;
};

// Find a vendor by ID
export const findVendorById = async (id: string): Promise<User | undefined> => {
  const params = {
    TableName: VENDORS_TABLE,
    Key: marshall({ id }),
  };

  const result = await dynamoDb.send(new GetItemCommand(params));
  return result.Item ? (unmarshall(result.Item) as User) : undefined;
};

// Create a new user
export const createUser = async (
  email: string,
  password: string,
  name: string
): Promise<User> => {
  const newUser: User = {
    id: String(Date.now()), // Use timestamp as ID
    email,
    password,
    name,
  };

  const params = {
    TableName: USERS_TABLE,
    Item: marshall(newUser),
  };

  await dynamoDb.send(new PutItemCommand(params));
  return newUser;
};

// Find a user by email
export const findUserByEmail = async (
  email: string
): Promise<User | undefined> => {
  const params = {
    TableName: USERS_TABLE,
    IndexName: "EmailIndex", // Ensure you create a GSI for email
    KeyConditionExpression: "#email = :email",
    ExpressionAttributeNames: { "#email": "email" },
    ExpressionAttributeValues: marshall({ ":email": email }),
  };

  const result = await dynamoDb.send(new QueryCommand(params));
  return result.Items?.[0] ? (unmarshall(result.Items[0]) as User) : undefined;
};

// Find a user by ID
export const findUserById = async (id: string): Promise<User | undefined> => {
  const params = {
    TableName: USERS_TABLE,
    Key: marshall({ id }),
  };

  const result = await dynamoDb.send(new GetItemCommand(params));
  return result.Item ? (unmarshall(result.Item) as User) : undefined;
};

// Update user password by ID
export const updateUserPassword = async (
  id: string,
  newPassword: string
): Promise<User | undefined> => {
  const params = {
    TableName: USERS_TABLE,
    Key: marshall({ id }),
    UpdateExpression: "SET #password = :newPassword",
    ExpressionAttributeNames: {
      "#password": "password",
    },
    ExpressionAttributeValues: marshall({
      ":newPassword": newPassword,
    }),
    ReturnValues: ReturnValue.ALL_NEW,
  };

  const result = await dynamoDb.send(new UpdateItemCommand(params));
  return result.Attributes
    ? (unmarshall(result.Attributes) as User)
    : undefined;
};


export const getUser = async (req: Request, res: Response): Promise<any> => {
  throw new Error("Unimplemented Function");
}