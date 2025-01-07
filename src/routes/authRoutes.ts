import { Router } from "express";
import {
  signupVendor,
  loginVendor,
  signupVendorRequestValidator,
  loginVendorRequestValidator,
  signupUser,
  signupUserRequestValidator,
  loginUser,
  loginUserRequestValidator,
  logoutUser,
  forgotPassword,
  resetPassword,
  getUser,
} from "../controllers/authController.ts";
import { authenticateJWT } from "../utils/authUtils.ts";

const router = Router();

// Signup route for a vendor
router.post("/signupVendor", signupVendorRequestValidator, signupVendor);

// Login route
router.post("/loginVendor", loginVendorRequestValidator, loginVendor);

// Signup route for users
router.post("/signup", signupUserRequestValidator, signupUser);

// Login route for users
router.post("/login", loginUserRequestValidator, loginUser);

// Logout route
router.post("/logout", logoutUser);

// Request Password Reset (Forgot Password)
router.post("/forgotPassword", forgotPassword);

// Reset Password
router.post("/resetPassword", resetPassword);

// Update User Details
router.post("/user", authenticateJWT, getUser);

export default router;
