import { Router } from "express";
import {
  authenticateJWT,
  validateDevice,
  validateDeviceClaim,
} from "../utils/authUtils.js";
import {
  claimDevice,
  deleteDevice,
  editDevice,
  getDevices,
  registerDevice,
} from "../controllers/deviceController.js";

const router = Router();

/**
 * @route   POST /register
 * @desc    Registers a device as claimable or updates its timestamp if already exists.
 * @access  Public (Requires device validation)
 */
router.post("/register", validateDevice, registerDevice);

/**
 * @route   POST /claimDevice
 * @desc    Allows a user to claim ownership of a device if it is available.
 * @access  Private (Requires JWT authentication)
 */
router.post("/claimDevice", authenticateJWT, validateDeviceClaim, claimDevice);

/**
 * @route   POST /getDevices
 * @desc    Retrieves a list of devices associated with the authenticated user.
 * @access  Private (Requires JWT authentication)
 */
router.post("/getDevices", authenticateJWT, getDevices);

/**
 * @route   POST /editDevice
 * @desc    Allows the user to edit device details.
 * @access  Private (Requires JWT authentication)
 */
router.post("/editDevice", authenticateJWT, editDevice);

/**
 * @route   POST /deleteDevice
 * @desc    Deletes a device owned by the user.
 * @access  Private (Requires JWT authentication)
 */
router.post("/deleteDevice", authenticateJWT, deleteDevice);

export default router;
