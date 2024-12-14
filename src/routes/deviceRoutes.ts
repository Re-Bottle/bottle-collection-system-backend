import { Router, Request, Response } from "express";
import {
  AttachPolicyCommand,
  CreateKeysAndCertificateCommand,
  CreateThingCommand,
  IoTClient,
  StartThingRegistrationTaskCommand,
  StartThingRegistrationTaskRequest,
} from "@aws-sdk/client-iot";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  PutCommand,
  DynamoDBDocumentClient,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { authenticateJWT } from "../utils/authUtils";
import {
  findDeviceById,
  findDevicesByVendor,
  registerDevice,
} from "../controllers/deviceController";
import { Device } from "../types/express";

const router = Router();

const iotClient = new IoTClient({ region: "ap-south-1" });

// const client = new DynamoDBClient({ region: "ap-south-1" });
// const docClient = DynamoDBDocumentClient.from(client);

/**
 * Modal for DynamoDB Record
 * _id: string // primary_key
 * mac_address: string
 * timestamp: string // Only claim device if timestamp is within 10 minutes
 * claimable: boolean // true by default
 * owner: string // null by default, userID of the owner
 */

/**
 * This function is called by the device to register itself with the server as claimable.
 * if the device provides an id, Call UpdateItem in DynamoDB where primary_key = id.
 *  - Update the record's Timestamp field to the current time.
 * else call AddItem to add a new device to the database. This will return a unique id.
 *  - send this unique id back to the device.
 *  - Device will store this id internally.
 */
router.post("/register", async (req: Request, res: Response): Promise<any> => {
  // Steps
  // Request needs to contain the Time of request and other device details (MAC Address)
  // Add device to the DynamoDB database as Claimable
  // Notes
  // Device should be auto deleted from database after 10 minutes if not claimed
  // Device also sends time, use this to determine if the device is still claimable
  // if the device was claimed within 10 minutes, call the registerDevice AWS function passing the vendors id
  // The resulting certificate is the send to the IOT device.

  // Device will send device_id
  const device_id = req.body.device_id;

  try {
    // Step 1: Create keys and certificate
    const createKeysAndCertCommand = new CreateKeysAndCertificateCommand({
      setAsActive: true,
    });
    const keysAndCert = await iotClient.send(createKeysAndCertCommand);

    // Step 2: Attach policy to certificate
    const attachPolicyCommand = new AttachPolicyCommand({
      policyName: "",
      target: keysAndCert.certificateArn,
    });
    await iotClient.send(attachPolicyCommand);

    // Step 3: Create IoT thing
    const createThingCommand = new CreateThingCommand({ thingName: device_id });
    const thing = await iotClient.send(createThingCommand);

    // Step 4: Return the provisioning information
    return res.json({
      certificateArn: keysAndCert.certificateArn,
      certificatePem: keysAndCert.certificatePem,
      privateKey: keysAndCert.keyPair?.PrivateKey,
      thingName: thing.thingName,
    });

    let deviceID: String | null = req.body.deviceID;
    deviceID = registerDevice(deviceID);

    if (deviceID != null) {
      return res.status(200).json({ deviceID });
    } else {
      return res.sendStatus(400);
    }
  } catch (e) {
    console.error(e);
    return res.sendStatus(500);
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
    const vendorId = req.body.vendorId;
    const deviceId = req.body.deviceId;
    const deviceName = req.body.deviceName;
    const deviceLocation = req.body.deviceLocation;
    const deviceDescription = req.body.deviceDescription;

    const device = findDeviceById(deviceId);

    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    } else {
      if (!device.claimableStatus) {
        return res.status(400).json({ message: "Device is not claimable" });
      } else {
        // Update the device record
        device.claimableStatus = false;
        device.vendorId = vendorId;
        device.deviceName = deviceName;
        device.deviceLocation = deviceLocation;
        device.deviceDescription = deviceDescription;

        return res.status(200).json({ message: "Device claimed successfully" });
      }
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

export default router;
