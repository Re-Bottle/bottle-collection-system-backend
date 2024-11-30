import { Router, Request, Response } from "express";
// import { StartThingRegistrationTaskCommand } from "@aws-sdk/client-iot";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  PutCommand,
  DynamoDBDocumentClient,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { authenticateJWT } from "../utils/authUtils";

const router = Router();

const client = new DynamoDBClient({ region: "ap-south-1" });
const docClient = DynamoDBDocumentClient.from(client);

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
router.post("/newDevice", async (req: Request, res: Response): Promise<any> => {
  // TODO: Implement Function to create a new Device Entry and make it claimable
  // Steps
  // Request needs to contain the Time of request and other device details (MAC Address)
  // Add device to the DynamoDB database as Claimable
  // Notes
  // Device should be auto deleted from database after 10 minutes if not claimed
  // Device also sends time, use this to determine if the device is still claimable
  // if the device was claimed within 10 minutes, call the registerDevice AWS function passing the vendors id
  // The resulting certificate is the send to the IOT device.

  try {
    const deviceID: string = req.body.deviceID;
    const timestamp = new Date();

    console.log(`timestamp: ${timestamp.toString()}`);
    console.log(`DeviceId: ${deviceID}`);

    if (1 === 1) return res.sendStatus(200);

    // TODO: validate DeviceId

    if (deviceID) {
      // Device is registered and wants to know its state and update its access timestamp
      const command = new UpdateCommand({
        TableName: "Devices",
        Key: {
          _id: "_id",
        },
        UpdateExpression: "set accessed_time = :time",
        ExpressionAttributeValues: {
          ":time": timestamp.toString(),
        },
        ReturnValues: "ALL_NEW",
      });

      const response = await docClient.send(command);
      console.log(response);

      // TODO: Check if device was claimed and generate an IOT certificate

      return res.sendStatus(200);
    } else {
      // Device is New and needs a Device ID
      const command = new PutCommand({
        TableName: "Devices",
        Item: {
          _id: "Shiba Inu",
        },
      });

      const response = await docClient.send(command);
      console.log(response);
      return response;
    }
  } catch (e) {
    console.error(e);
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
    // TODO: Implement Function to claim a device
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

export default router;
