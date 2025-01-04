import { Router, Request, Response } from "express";
import { UpdateCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import {
  authenticateJWT,
  validateDevice,
  validateDeviceClaim,
} from "../utils/authUtils.ts";
import {
  claimDevice,
  findDeviceById,
  findDevicesByVendor,
  registerDevice,
} from "../controllers/deviceController.ts";

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

// Add Scanned Bottle
router.post(
  "/createScan",
  async (req: Request, res: Response): Promise<any> => {
    // TODO: Implement Function
    throw new Error("Unimplemented Function");
  }
);

router.post(
  "/getDevices",
  authenticateJWT,
  async (req: Request, res: Response): Promise<any> => {
    const vendorId = req.body.vendorId;
    if (!vendorId)
      return res.status(400).json({ message: "Vendor ID missing" });
    const devices = await findDevicesByVendor(vendorId);
    // const devices: Device[] | undefined = await findDevicesByVendor(vendorId);
    if (!devices) return res.status(404).json({ message: "No devices found" });
    return res.status(200).json({ devices });
  }
);

router.post(
  "/getDeviceDetails/:deviceId",
  authenticateJWT,
  async (req: Request, res: Response): Promise<any> => {
    const { deviceId } = req.params;
    const vendorId = req.user?.id; // Vendor ID should still be part of the request body or user info (e.g., via JWT)

    if (!vendorId)
      return res.status(400).json({ message: "Vendor ID missing" });

    try {
      const device = findDeviceById(deviceId);
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }

      return res.status(200).json({ device });
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
