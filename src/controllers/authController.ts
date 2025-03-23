import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import crypto from "crypto";

import DynamoDB from "../repository/dynamoDB.js";
import { createSignedToken } from "../utils/authUtils.js";
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

    // Generate a random 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Store OTP in database
    await repository.storeOTP(email, otp);

    // Send OTP via email
    try {
      await sendEmail(email, otp);
      return res.json({ message: "OTP sent successfully" });
    } catch (error) {
      await repository.deleteOTP(email);
      return res.status(500).json({ message: "Failed to send OTP" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

function sendEmail(recipient_email: string, OTP: string) {
  return new Promise((resolve, reject) => {
    var username = process.env.EMAIL_USER;
    var password = process.env.EMAIL_APP_PASSWORD;
    var transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: username,
        pass: password,
      },
      logger: true,
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipient_email,
      subject: "ReBottle Password Recovery",
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset OTP</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f9f9f9;
      margin: 0;
      padding: 0;
      color: #333;
    }
    .email-container {
      width: 100%;
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    .email-header {
      background-color: #ECF1DA;
      color: #000000;
      text-align: center;
      padding: 20px;
    }
    .email-body {
      padding: 30px;
      font-size: 16px;
      line-height: 1.6;
    }
    .otp {
      font-size: 46px;
      font-weight: bold;
      color: #23583A;
      text-align: center;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 12px;
      background-color: #f1f1f1;
      color: #888;
    }
    .footer a {
      color: #0000ff;
      text-decoration: none;
    }
    .button {
      display: inline-block;
      background-color: #23583A;
      color: #fff;
      padding: 10px 20px;
      text-decoration: none;
      font-size: 16px;
      border-radius: 5px;
      margin-top: 20px;
      text-align: center;
    }
    .button:hover {
      background-color: #12470b;
    }
    /* ReBottle branding style */
    .brand-name {
      color: #23583A; /* Green color */
      font-family: 'Noto Sans Devanagari', sans-serif; /* Fallback to sans-serif */
      font-weight: bold;
    }
  </style>
  <!-- Google Fonts for Noto Sans Devanagari -->
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@700&display=swap" rel="stylesheet">
</head>
<body>
    

  <div class="email-container">
    <div class="email-header">
      <h1><span class="brand-name">ReBottle</span> Password Reset Request</h1>
    </div>
    
    <div class="email-body">
      <p>Hello,</p>
      <p>We received a request to reset your password for your <span class="brand-name">ReBottle</span> account. To reset your password, please use the following One-Time Password (OTP):</p>

      <div class="otp">${OTP}</div>
      
      <p>This OTP is valid for the next 10 minutes, so please use it before it expires. If you did not request a password reset, you can safely ignore this email.</p>
      
      <p>If you want to reset your password, click the button below:</p>
      
      <a href="{{resetLink}}" class="button">Reset Password</a>
      
      <p>Thank you for using <span class="brand-name">ReBottle</span>!</p>
    </div>

    <div class="footer">
      <p>If you have any questions, feel free to <a href="mailto:support@rebottle.com">contact our support team</a>.</p>
      <p>&copy; 2025 <span class="brand-name">ReBottle</span>, All Rights Reserved.</p>
    </div>
  </div>

</body>
</html>`,
    };

    interface MailOptions {
      from: string;
      to: string;
      subject: string;
      html: string;
    }

    interface SendMailInfo {
      response: string;
    }

    transporter.sendMail(
      mailOptions as MailOptions,
      (error: Error | null, info: SendMailInfo) => {
        if (error) {
          console.log(error);
          return reject({ message: "Failed to send email", error });
        } else {
          console.log("Email sent: " + info.response);
          return resolve({ message: "Email sent successfully" });
        }
      }
    );
  });
}

export const sendResetEmail = async (req: Request, res: Response) => {
  sendEmail(req.body.email, req.body.OTP)
    .then((response: any) =>
      res.status(200).json({ message: response.message })
    )
    .catch((error: any) => res.status(500).json({ message: error.message }));
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { email, otp, newPassword } = req.body;

    // Verify OTP
    const isValid = await repository.verifyOTP(email, otp);
    if (!isValid) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    // Find the user
    const user = await repository.findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await repository.updateUserPassword(
      user.id,
      hashedPassword
    );

    if (updatedUser) {
      // Delete the used OTP
      await repository.deleteOTP(email);
      return res.json({
        message: "Password successfully updated",
      });
    }

    return res.status(500).json({ message: "Failed to update password" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
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
