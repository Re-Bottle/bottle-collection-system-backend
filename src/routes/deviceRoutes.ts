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
 * This function is called by the device to register itself with the server as claimable.
 * if the device provides an id, Call UpdateItem in DynamoDB where primary_key = id.
 *  - Update the record's Timestamp field to the current time.
 * else call AddItem to add a new device to the database. This will return a unique id.
 *  - send this unique id back to the device.
 *  - Device will store this id internally.
 */
router.post("/register", validateDevice, registerDevice);

/**
 * This function is called by the user to claim a device.
 * If the device is claimable, it is claimed by the user.
 * If the device is not claimable, an error is thrown.
 * This function will set claimable to false and set the userId attribute on the record in the database.
 * For a device to be claimable, it's last timestamp must be less than current time.
 */
router.post("/claimDevice", authenticateJWT, validateDeviceClaim, claimDevice);

router.post("/getDevices", authenticateJWT, getDevices);

router.post("/editDevice", authenticateJWT, editDevice);

router.post("/deleteDevice", authenticateJWT, deleteDevice);

export default router;
