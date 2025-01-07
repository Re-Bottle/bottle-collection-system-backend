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
  deleteUser,
  userRequestValidator,
} from "../controllers/authController.js";
import { authenticateJWT } from "../utils/authUtils.js";

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
router.post("/user", authenticateJWT, userRequestValidator, getUser);

router.post("/deleteUser", authenticateJWT, userRequestValidator, deleteUser);

export default router;
