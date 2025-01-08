import { NextFunction, Request, Response } from "express";
import type { Device } from "../types/express.d.ts";
import DynamoDB from "../repository/dynamoDB.js";
import RepositoryInterface from "../repository/repositoryInterface.js";
import { IOTProvider } from "../iot/iotInterface.js";

/**
 * Model for DynamoDB Record
 * _id: string // primary_key, unique, genereated by device
 * mac_address: string
 * timestamp: string // Only claim device if timestamp is within 10 minutes
 * claimable: boolean // true by default
 * owner: string // null by default, userID of the owner after claiming
 */

const repository: RepositoryInterface = DynamoDB.getInstance();
const iotInterface = IOTProvider.getInstance();

/**
 * @route POST /register
 * @param request: string The Express Request Object
 * @param response: string The Express Response Object
 * @param next: NextFunction The Next Function to be called if any
 * @returns response.status: 200, 400, 500
 * @description
 * This method is used by the device to register itself.
 * Device can be in any one of the following States:
 * - Unregistered: Device is New and not in the database yet
 * - Registered: Device is registered but not yet provisioned
 * - Provisioned: Device is recieved its Certificates and is ready to use
 */
export const registerDevice = async (
  request: Request,
  response: Response,
  _: NextFunction
): Promise<any> => {
  const { deviceId, macAddress } = request.body;

  try {
    // Getting Device Data from DynamoDB
    const device = await repository.getDevice(deviceId);
    if (device) {
      // Condition: Device Exists in Database already
      if (device.whenProvisioned)
        // Condition: Device is already provisioned
        return response.status(400).json({
          message: "Attempt to register an already provisioned device was Made",
          deviceState: "Error",
        });

      let updatedDevice: Device;

      if (device.whenClaimed) {
        // Condition: Device is Registered but not yet provisioned
        const keysAndCertificates =
          await iotInterface.createThingWithCertificate(deviceId);
        updatedDevice = await repository.updateDeviceTimestamp(deviceId, true);
        return response.status(201).json({
          message: "Device Provisioned Successfully",
          deviceState: "Provisioned",
          timestamp: updatedDevice.timestamp,
          ...keysAndCertificates,
        });
      } else {
        updatedDevice = await repository.updateDeviceTimestamp(deviceId, false);
        return response.status(200).json({
          message: "Device already exists. Timestamp updated.",
          deviceState: "Registered",
          timestamp: updatedDevice.timestamp,
        });
      }
    } else {
      //Condition: Device is not yet Registered
      await repository.createDevice(deviceId, macAddress);
      return response.status(200).json({
        message: "Device Created Successfully",
        deviceState: "Registered",
      });
    }
  } catch (error) {
    console.error("Error provisioning device:", error);
    return response
      .status(500)
      .json({ message: "Failed to provision device", error });
  }
};

export const claimDevice = async (
  request: Request,
  response: Response,
  _: NextFunction
): Promise<any> => {
  const { deviceId, vendorId, deviceName, deviceLocation, deviceDescription } =
    request.body;

  try {
    const device = await repository.getDevice(deviceId);
    if (device == null) {
      return response.status(404).json({ message: "Device not found" });
    }
    if (device.whenClaimed) {
      return response
        .status(400)
        .json({ message: "Device is not pending confirmation" });
    }
    // Verify that the device's timestamp is within the allowed window (e.g., 10 minutes)
    const timestamp = new Date().toISOString();
    const deviceTimestamp = new Date(device.timestamp).getTime();
    const currentTimestamp = new Date().getTime();

    const timeDifference = currentTimestamp - deviceTimestamp;
    const tenMinutesInMillis = 10 * 60 * 1000; // 10 minutes in milliseconds
    if (timeDifference > tenMinutesInMillis) {
      return response
        .status(400)
        .json({ message: "Device registration has expired" });
    }
    const registeredDevice = repository.registerDevice(
      deviceId,
      vendorId,
      deviceName,
      deviceLocation,
      deviceDescription
    );

    // Step 5: Return success response
    return response.status(200).json({
      message: "Device registration confirmed successfully.",
      device: registeredDevice,
    });
  } catch (error) {
    console.error("Error confirming device registration:", error);
    return response
      .status(500)
      .json({ message: "Failed to confirm registration", error });
  }
};

export const createScan = async (req: Request, res: Response): Promise<any> => {
  // TODO: Implement Function
  throw new Error("Unimplemented Function");
};

export const getDevices = async (req: Request, res: Response): Promise<any> => {
  const vendorId = req.body.vendorId;
  if (!vendorId) return res.status(400).json({ message: "Vendor ID missing" });
  const devices = await repository.findDevicesByVendor(vendorId);
  // const devices: Device[] | undefined = await findDevicesByVendor(vendorId);
  if (!devices) return res.status(404).json({ message: "No devices found" });
  return res.status(200).json({ devices });
};

export const getDeviceDetails = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { deviceId } = req.params;
  const vendorId = req.user?.id; // Vendor ID should still be part of the request body or user info (e.g., via JWT)

  if (!vendorId) return res.status(400).json({ message: "Vendor ID missing" });

  try {
    const device = repository.findDeviceById(deviceId);
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    return res.status(200).json({ device });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};
