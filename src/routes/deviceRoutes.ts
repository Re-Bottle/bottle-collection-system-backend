import { Router, Request, Response } from "express";
import {
  AttachPolicyCommand,
  CreateKeysAndCertificateCommand,
  CreateThingCommand,
  IoTClient,
  StartThingRegistrationTaskCommand,
  StartThingRegistrationTaskRequest,
} from "@aws-sdk/client-iot";
import { DynamoDBClient, ReturnValue } from "@aws-sdk/client-dynamodb";
import {
  PutCommand,
  DynamoDBDocumentClient,
  UpdateCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";
import { authenticateJWT } from "../utils/authUtils";
import {
  findDeviceById,
  findDevicesByVendor,
  registerDevice,
} from "../controllers/deviceController";
import { Device } from "../types/express";

const router = Router();

const iotClient = new IoTClient({
  region: process.env.AWS_REGION || "ap-south-1",
});

/**
 * Model for DynamoDB Record
 * _id: string // primary_key, unique, genereated by device
 * mac_address: string
 * timestamp: string // Only claim device if timestamp is within 10 minutes
 * claimable: boolean // true by default
 * owner: string // null by default, userID of the owner after claiming
 */
const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-south-1",
  endpoint: "http://localhost:8000", // Local DynamoDB endpoint
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);

const DEVICES_TABLE = "Devices";
const IOT_POLICY_NAME = process.env.IOT_POLICY_NAME || "IoTDevicePolicy";

/**
 * This function is called by the device to register itself with the server as claimable.
 * if the device provides an id, Call UpdateItem in DynamoDB where primary_key = id.
 *  - Update the record's Timestamp field to the current time.
 * else call AddItem to add a new device to the database. This will return a unique id.
 *  - send this unique id back to the device.
 *  - Device will store this id internally.
 */
router.post("/register", async (req: Request, res: Response): Promise<any> => {
  const { device_id, mac_address } = req.body;

  if (!mac_address) {
    return res.status(400).json({ message: "MAC address is required" });
  }

  try {
    // Step 1: Check if the device already exists in DynamoDB
    const getParams = {
      TableName: DEVICES_TABLE,
      Key: { deviceId:device_id },
    };

    const device = await docClient.send(new GetCommand(getParams));

    // Step 2: If device exists, update the timestamp (no need to create new keys)
    if (device.Item) {
      const timestamp = new Date().toISOString();
      const updateParams = {
        TableName: DEVICES_TABLE,
        Key: { device_id },
        UpdateExpression: "set #ts = :timestamp", // Use #ts as a placeholder for 'timestamp'
        ExpressionAttributeNames: {
          "#ts": "timestamp", // Map #ts to 'timestamp'
        },
        ExpressionAttributeValues: {
          ":timestamp": timestamp,
        },
        ReturnValues: ReturnValue.ALL_NEW, // Optionally return the updated item
      };
      const updatedDevice = await docClient.send(
        new UpdateCommand(updateParams)
      );

      return res.status(200).json({
        message: "Device already exists. Timestamp updated.",
        deviceId: device_id,
        timestamp: updatedDevice.Attributes?.timestamp,
      });
    }

    // Step 3: If device doesn't exist, create IoT keys and certificate
    const createKeysAndCertCommand = new CreateKeysAndCertificateCommand({
      setAsActive: true,
    });
    const keysAndCert = await iotClient.send(createKeysAndCertCommand);

    // Step 4: Save the provisioning data to DynamoDB in "pending" state
    const timestamp = new Date().toISOString();
    const putParams = {
      TableName: DEVICES_TABLE,
      Item: {
        deviceId:device_id,
        mac_address,
        timestamp,
        claimable: true, // claimable
        status: "pending", // Device registration is pending
        owner: null,
      },
    };
    await docClient.send(new PutCommand(putParams));

    // Step 5: Return provisioning details to the device
    return res.status(200).json({
      message: "Device provisioned successfully. Awaiting user confirmation.",
      provisioningDetails: {
        certificateArn: keysAndCert.certificateArn,
        certificatePem: keysAndCert.certificatePem,
        privateKey: keysAndCert.keyPair?.PrivateKey,
      },
    });
  } catch (error) {
    console.error("Error provisioning device:", error);
    return res
      .status(500)
      .json({ message: "Failed to provision device", error });
  }
});

/**
 * This function is called by the user to claim a device.
 * If the device is claimable, it is claimed by the user.
 * If the device is not claimable, an error is thrown.
 * This function will set claimable to false and set the userId attribute on the record in the database.
 * For a device to be claimable, it's last timestamp must be less than current time.
 */
router.post(
  "/claimDevice",
  authenticateJWT,
  async (req: Request, res: Response): Promise<any> => {
    const { device_id, user_id } = req.body;

    if (!device_id || !user_id) {
      return res
        .status(400)
        .json({ message: "Device ID and User ID are required" });
    }

    try {
      // Step 1: Retrieve the pending device from DynamoDB
      const getDeviceCommand = new GetCommand({
        TableName: DEVICES_TABLE,
        Key: { device_id },
      });
      const device = await docClient.send(getDeviceCommand);

      if (!device || !device.Item) {
        return res.status(404).json({ message: "Device not found" });
      }

      // Step 2: Verify the device's status
      const deviceData = device.Item;
      if (deviceData.status !== "pending") {
        return res
          .status(400)
          .json({ message: "Device is not pending confirmation" });
      }

      // Step 3: Verify that the device's timestamp is within the allowed window (e.g., 10 minutes)
      const timestamp = new Date().toISOString();
      const deviceTimestamp = new Date(deviceData.timestamp).getTime();
      const currentTimestamp = new Date().getTime();

      const timeDifference = currentTimestamp - deviceTimestamp;
      const tenMinutesInMillis = 10 * 60 * 1000; // 10 minutes in milliseconds

      if (timeDifference > tenMinutesInMillis) {
        return res
          .status(400)
          .json({ message: "Device registration has expired" });
      }

      // Step 4: Update the device status to "registered" and set the owner
      const updateCommand = new UpdateCommand({
        TableName: DEVICES_TABLE,
        Key: { device_id },
        UpdateExpression:
          "SET #status = :registered, owner = :user_id, claimable = :false",
        ExpressionAttributeNames: {
          "#status": "status",
        },
        ExpressionAttributeValues: {
          ":registered": "registered",
          ":user_id": user_id,
          ":false": false,
        },
        ReturnValues: "ALL_NEW",
      });
      const updatedDevice = await docClient.send(updateCommand);

      // Step 5: Return success response
      return res.status(200).json({
        message: "Device registration confirmed successfully.",
        device: updatedDevice.Attributes,
      });
    } catch (error) {
      console.error("Error confirming device registration:", error);
      return res
        .status(500)
        .json({ message: "Failed to confirm registration", error });
    }
  }
);

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
    const devices: Device[] | undefined = findDevicesByVendor(vendorId);
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

    if (!vendorId) return res.status(400).json({ message: "Vendor ID missing" });

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
