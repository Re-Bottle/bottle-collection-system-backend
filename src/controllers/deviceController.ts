import { NextFunction, Request, Response } from "express";
import type { Device } from "../types/express.d.ts";
import {
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandOutput,
  PutCommand,
  PutCommandOutput,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import {
  AttachThingPrincipalCommand,
  CreateKeysAndCertificateCommand,
  CreateKeysAndCertificateCommandOutput,
  CreateThingCommand,
  IoTClient,
} from "@aws-sdk/client-iot";
import {
  DynamoDBClient,
  QueryCommand,
  ReturnValue,
} from "@aws-sdk/client-dynamodb";

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
    const device = await getDeviceFromDatabase(deviceId);
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
        const keysAndCertificates = await createThingWithCertificate(deviceId);
        updatedDevice = await updateDeviceTimestamp(deviceId, true);
        return response.status(201).json({
          message: "Device Provisioned Successfully",
          deviceState: "Provisioned",
          timestamp: updatedDevice.lastActionTimestamp,
          ...keysAndCertificates,
        });
      } else {
        updatedDevice = await updateDeviceTimestamp(deviceId);
        return response.status(200).json({
          message: "Device already exists. Timestamp updated.",
          deviceState: "Registered",
          timestamp: updatedDevice.lastActionTimestamp,
        });
      }
    } else {
      //Condition: Device is not yet Registered
      await createNewDeviceEntry(deviceId, macAddress);
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
    const device = await getDeviceFromDatabase(deviceId);
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
    const deviceTimestamp = new Date(device.lastActionTimestamp).getTime();
    const currentTimestamp = new Date().getTime();

    const timeDifference = currentTimestamp - deviceTimestamp;
    const tenMinutesInMillis = 10 * 60 * 1000; // 10 minutes in milliseconds
    if (timeDifference > tenMinutesInMillis) {
      return response
        .status(400)
        .json({ message: "Device registration has expired" });
    }
    const registeredDevice = registerDeviceInDB(
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
  if (!vendorId)
    return res.status(400).json({ message: "Vendor ID missing" });
  const devices = await findDevicesByVendor(vendorId);
  // const devices: Device[] | undefined = await findDevicesByVendor(vendorId);
  if (!devices) return res.status(404).json({ message: "No devices found" });
  return res.status(200).json({ devices });
}

export const getDeviceDetails =   async (req: Request, res: Response): Promise<any> => {
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


const registerDeviceInDB = async (
  deviceId: string,
  vendorId: string,
  deviceName: string,
  deviceLocation: string,
  deviceDescription: string
) => {
  const timestamp = new Date().toISOString();
  const updateParams = {
    TableName: DEVICES_TABLE,
    Key: {
      deviceId, // The partition key of the item
    },
    UpdateExpression: `
    SET
      vendorId = :vendorId,
      deviceName = :deviceName,
      deviceLocation = :deviceLocation,
      deviceDescription = :deviceDescription,
      deviceActiveStatus = :deviceActiveStatus,
      whenClaimed = :whenClaimed,
      lastActionTimestamp = :lastActionTimestamp
  `,
    ExpressionAttributeValues: {
      ":vendorId": vendorId,
      ":deviceName": deviceName,
      ":deviceLocation": deviceLocation,
      ":deviceDescription": deviceDescription,
      ":deviceActiveStatus": false, // Default value
      ":whenClaimed": timestamp,
      ":lastActionTimestamp": timestamp,
    },
    ReturnValues: ReturnValue.ALL_NEW,
  };
  const data = await docClient.send(new UpdateCommand(updateParams));
  return data.Attributes;
};

export const findDevicesByVendor = async (
  vendorId: string
): Promise<Device[] | undefined> => {
  const params = {
    TableName: DEVICES_TABLE,
    IndexName: "VendorIdIndex",
    KeyConditionExpression: "#vendorId = :vendorId",
    ExpressionAttributeNames: { "#vendorId": "vendorId" },
    ExpressionAttributeValues: marshall({ ":vendorId": vendorId }),
  };
  const result = await dynamoClient.send(new QueryCommand(params));
  // return result.Items?.[0]
  //   ? (unmarshall(result.Items[0]) as Device)
  //   : undefined;
  return result.Items?.length
    ? result.Items.map((item) => unmarshall(item) as Device)
    : undefined;
};

export const findDeviceById = async (
  deviceId: string
): Promise<Device | undefined> => {
  const params = {
    TableName: DEVICES_TABLE,
    Key: marshall({ deviceId }),
  };
  const result = await dynamoClient.send(new GetCommand(params));
  return result.Item ? (unmarshall(result.Item) as Device) : undefined;
};

const createThingWithCertificate = async (thingName: string): Promise<any> => {
  try {
    // Step 1: Create keys and certificate
    const createKeysAndCertCommand = new CreateKeysAndCertificateCommand({
      setAsActive: false, // Activate the certificate
    });

    const certResponse: CreateKeysAndCertificateCommandOutput =
      await iotClient.send(createKeysAndCertCommand);

    const { certificateArn, certificateId, certificatePem, keyPair } =
      certResponse;
    console.log("Certificate created successfully:", {
      certificateId,
      certificateArn,
    });

    // Step 2: Create an IoT Thing
    const createThingCommand = new CreateThingCommand({
      thingName, // Name of the Thing
    });

    const thingResponse = await iotClient.send(createThingCommand);
    console.log("Thing created successfully:", thingResponse);

    // Step 3: Attach the certificate to the Thing
    const attachThingPrincipalCommand = new AttachThingPrincipalCommand({
      thingName,
      principal: certificateArn, // Attach the certificate ARN
    });

    await iotClient.send(attachThingPrincipalCommand);
    console.log(`Certificate attached to Thing "${thingName}" successfully.`);

    return Promise.resolve({
      certificateId,
      certificateArn,
      certificatePem,
      keyPair,
    });
  } catch (error) {
    console.error("Error in creating Thing and attaching certificate:", error);
    return Promise.reject(error);
  }
};

const getDeviceFromDatabase = async (
  deviceId: string
): Promise<Device | null> => {
  const getParams = {
    TableName: DEVICES_TABLE,
    Key: { deviceId },
  };

  // Getting Device Data from DynamoDB
  return getDeviceResultMapper(await docClient.send(new GetCommand(getParams)));
};

const updateDeviceTimestamp = async (
  deviceId: String,
  wasProvisioned: Boolean = false
): Promise<Device> => {
  const timestamp = new Date().toISOString();
  let updateParams = {
    TableName: DEVICES_TABLE,
    Key: { deviceId },
    UpdateExpression: "set #ts = :timestamp", // Use #ts as a placeholder for 'timestamp'
    ExpressionAttributeNames: {
      "#ts": "timestamp",
    },
    ExpressionAttributeValues: {
      ":timestamp": timestamp,
    },
    ReturnValues: ReturnValue.ALL_NEW,
  };

  if (wasProvisioned) {
    updateParams = {
      ...updateParams,
      UpdateExpression: "set #ts = :timestamp, whenProvisioned = :timestamp",
      ExpressionAttributeNames: {
        ...updateParams.ExpressionAttributeNames,
      },
    };
  }

  return putDeviceResultMapper(
    await docClient.send(new UpdateCommand(updateParams))
  );
};

const createNewDeviceEntry = async (deviceId: String, macAddress: String) => {
  const timestamp = new Date().toISOString();
  const putParams = {
    TableName: DEVICES_TABLE,
    Item: {
      deviceId,
      macAddress,
      vendorId: "Unclaimed",

      deviceName: null,
      deviceLocation: null,
      deviceFillLevel: 0,
      deviceDescription: null,
      deviceActiveStatus: false,

      whenClaimed: null,
      whenProvisioned: null,

      lastActionTimestamp: timestamp,
    },
  };
  await docClient.send(new PutCommand(putParams));
};

const getDeviceResultMapper = (result: GetCommandOutput): Device | null =>
  result.Item?.deviceId
    ? {
        deviceId: result.Item?.deviceId || "",
        macAddress: result.Item?.macAddress || "",
        vendorId: result.Item?.vendorId || null,
        deviceName: result.Item?.deviceName || null,
        deviceLocation: result.Item?.deviceLocation || null,
        deviceFillLevel: result.Item?.deviceFillLevel || 0,
        deviceDescription: result.Item?.deviceDescription || null,
        deviceActiveStatus: result.Item?.deviceActiveStatus || false,
        whenClaimed: result.Item?.whenClaimed || null,
        whenProvisioned: result.Item?.whenProvisioned || null,
        lastActionTimestamp: result.Item?.lastActionTimestamp || new Date(),
      }
    : null;

const putDeviceResultMapper = (result: PutCommandOutput): Device => ({
  deviceId: result.Attributes?.deviceId || "",
  macAddress: result.Attributes?.macAddress || "",
  vendorId: result.Attributes?.vendorId || null,
  deviceName: result.Attributes?.deviceName || null,
  deviceLocation: result.Attributes?.deviceLocation || null,
  deviceFillLevel: result.Attributes?.deviceFillLevel || 0,
  deviceDescription: result.Attributes?.deviceDescription || null,
  deviceActiveStatus: result.Attributes?.deviceActiveStatus || false,
  whenClaimed: result.Attributes?.whenClaimed || null,
  whenProvisioned: result.Attributes?.whenProvisioned || null,
  lastActionTimestamp: result.Attributes?.lastActionTimestamp || new Date(),
});

const getDevicesResultMapper = (result: any): Device => ({
  deviceId: result.deviceId || "",
  macAddress: result.macAddress || "",
  vendorId: result.vendorId || null,
  deviceName: result.deviceName || null,
  deviceLocation: result.deviceLocation || null,
  deviceFillLevel: result.deviceFillLevel || 0,
  deviceDescription: result.deviceDescription || null,
  deviceActiveStatus: result.deviceActiveStatus || false,
  whenClaimed: result.whenClaimed || null,
  whenProvisioned: result.whenProvisioned || null,
  lastActionTimestamp: result.lastActionTimestamp || new Date(),
});
