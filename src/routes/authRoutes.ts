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
  updateUser,
  deleteUser,
  userRequestValidator,
  deleteVendor,
  sendResetEmail,
} from "../controllers/authController.js";

import { authenticateJWT } from "../utils/authUtils.js"; // Middleware for JWT authentication

const router = Router();

/**
 * @route   POST /signupVendor
 * @desc    Register a new vendor
 * @access  Public (Requires request validation)
 */
router.post("/signupVendor", signupVendorRequestValidator, signupVendor);

/**
 * @route   POST /loginVendor
 * @desc    Login an existing vendor
 * @access  Public (Requires request validation)
 */
router.post("/loginVendor", loginVendorRequestValidator, loginVendor);

/**
 * @route   POST /deleteVendor
 * @desc    Deletes a vendor (Requires authentication)
 * @access  Private (Requires JWT authentication)
 */
router.post("/deleteVendor", authenticateJWT, deleteVendor);

/**
 * @route   POST /signup
 * @desc    Register a new user
 * @access  Public (Requires request validation)
 */
router.post("/signup", signupUserRequestValidator, signupUser);

/**
 * @route   POST /login
 * @desc    Login an existing user
 * @access  Public (Requires request validation)
 */
router.post("/login", loginUserRequestValidator, loginUser);

/**
 * @route   POST /logout
 * @desc    Logs out the user
 * @access  Public
 */
router.post("/logout", logoutUser);

/**
 * @route   POST /forgotPassword
 * @desc    Initiates password reset process by sending a reset link to the user
 * @access  Public
 */
router.post("/forgotPassword", forgotPassword);

/**
 * @route   POST /resetPassword
 * @desc    Resets the user's password using the reset token
 * @access  Public
 */
router.post("/resetPassword", resetPassword);

/**
 * @route   POST /sendResetEmail
 * @desc    Sends a password reset email to the user
 * @access  Public
 */
router.post("/sendResetEmail", sendResetEmail);

/**
 * @route   POST /user
 * @desc    Updates user details (Requires authentication)
 * @access  Private (Requires JWT authentication)
 */
router.post("/user", authenticateJWT, userRequestValidator, updateUser);

/**
 * @route   POST /deleteUser
 * @desc    Deletes a user (Requires authentication)
 * @access  Private (Requires JWT authentication)
 */
router.post("/deleteUser", authenticateJWT, deleteUser);

export default router;
