import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { VerifyErrors } from "jsonwebtoken";

import DynamoDB from "../repository/dynamoDB.js";
import {
  createResetToken,
  createSignedToken,
  validateToken,
} from "../utils/authUtils.js";
import RepositoryInterface from "../repository/repositoryInterface.js";

const repository: RepositoryInterface = DynamoDB.getInstance();

export const signupVendorRequestValidator = (
  req: Request,
  res: Response,
  next: NextFunction
): any => {
  let { email, password, name } = req.body;

  email = email?.trim();
  password = password?.trim();
  name = name?.trim();

  if (!email || !password || !name) {
    return res
      .status(400)
      .json({ error: "Missing required fields: email, password, and name" });
  }

  if (email.length === 0 || password.length === 0 || name.length === 0) {
    return res.status(400).json({ error: "Fields cannot be empty" });
  }

  next();
};

export const signupVendor = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { email, password, name } = req.body;

    // Check if the user already exists
    const userExists = await repository.findVendorByEmail(email);
    if (userExists) {
      return res.status(400).json({ message: "Vendor already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const newUser = repository.createVendor(email, hashedPassword, name);

    return res
      .status(201)
      .json({ message: "Vendor created successfully", user: newUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const loginVendorRequestValidator = (
  req: Request,
  res: Response,
  next: NextFunction
): any => {
  let { email, password } = req.body;

  email = email?.trim();
  password = password?.trim();

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "Missing required fields: email and password" });
  }

  if (email.length === 0 || password.length === 0) {
    return res.status(400).json({ error: "Fields cannot be empty" });
  }

  next();
};

export const loginVendor = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await repository.findVendorByEmail(email);

    if (!user) {
      return res.status(400).json({ message: "Vendor not found" });
    }

    // Check if password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = createSignedToken(user, email);

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

export const deleteVendor = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { vendorId } = req.body;
  const result = await repository.deleteVendor(vendorId);
  if (result) {
    return res.json({ message: "Vendor deleted successfully" });
  } else {
    return res.status(500).json({ message: "Failed to delete vendor" });
  }
};

export const signupUserRequestValidator = (
  req: Request,
  res: Response,
  next: NextFunction
): any => {
  let { email, password, name } = req.body;

  email = email?.trim();
  password = password?.trim();
  name = name?.trim();

  if (!email || !password || !name) {
    return res
      .status(400)
      .json({ error: "Missing required fields: email, password, and name" });
  }

  if (email.length === 0 || password.length === 0 || name.length === 0) {
    return res.status(400).json({ error: "Fields cannot be empty" });
  }

  next();
};

export const loginUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await repository.findUserByEmail(email);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check if password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create a JWT token
    const token = createSignedToken(user, email);

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
};

export const loginUserRequestValidator = (
  req: Request,
  res: Response,
  next: NextFunction
): any => {
  let { email, password } = req.body;

  email = email?.trim();
  password = password?.trim();

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "Missing required fields: email and password" });
  }

  if (email.length === 0 || password.length === 0) {
    return res.status(400).json({ error: "Fields cannot be empty" });
  }

  next();
};

export const logoutUser = async (req: Request, res: Response): Promise<any> => {
  res.clearCookie("auth_token");
  return res.json({ message: "Logged out successfully" });
};

export const signupUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password, name } = req.body;

    // Check if the user already exists
    const userExists = await repository.findUserByEmail(email);
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const newUser = await repository.createUser(email, hashedPassword, name);

    return res
      .status(201)
      .json({ message: "User created successfully", user: { id: newUser.id } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { email } = req.body;

    // Find the user by email
    const user = await repository.findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const resetToken = createResetToken(email);

    // Send the reset token to the user's email (integrate with an email service here?)
    return res.json({
      message: "Password reset token sent",
      resetToken: resetToken,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { resetToken, newPassword } = req.body;

    // Verify the reset token
    let decoded: any;
    try {
      decoded = validateToken(
        resetToken,
        (err: VerifyErrors | null, decoded: any) => {
          if (err)
            return res
              .status(400)
              .json({ message: "Invalid or expired reset token" });
          // TODO: implement callback for password change
        }
      );
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token", reason: error });
    }

    // Find the user by email from the token
    const user = await repository.findUserByEmail(decoded.email);
    if (user) {
      // Update user password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const updatedUser = await repository.updateUserPassword(
        user.id,
        hashedPassword
      );
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

    return res.status(400).json({ message: "User not found" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<any> => {
  const { id, name } = req.body;
  console.log(id, name);
  const result = await repository.updateUserName(id, name);
  if (result) {
    return res.json({ message: "User details updated successfully" });
  } else {
    return res.status(500).json({ message: "Failed to update user details" });
  }
};

export const userRequestValidator = (
  req: Request,
  res: Response,
  next: NextFunction
): any => {
  let { id, name } = req.body;

  id = id?.trim();
  name = name?.trim();

  if (!id || !name) {
    return res
      .status(400)
      .json({ error: "Missing required field: id or name" });
  }

  if (id.length === 0 || name.length === 0) {
    return res.status(400).json({ error: "Field cannot be empty" });
  }

  next();
};

export const deleteUser = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.body;
  if (!id || id.length === 0)
    return res.status(400).json({ error: "User ID missing" });
  const result = await repository.deleteUser(id);
  if (result) {
    return res.json({ message: "User deleted successfully" });
  } else {
    return res.status(500).json({ error: "Failed to delete user" });
  }
};
