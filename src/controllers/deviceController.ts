import { NextFunction, Request, Response } from "express";
import { Device } from "../types/express";
import {
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandOutput,
  PutCommand,
  PutCommandOutput,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  AttachThingPrincipalCommand,
  CreateKeysAndCertificateCommand,
  CreateKeysAndCertificateCommandOutput,
  CreateThingCommand,
  IoTClient,
} from "@aws-sdk/client-iot";
import { DynamoDBClient, ReturnValue } from "@aws-sdk/client-dynamodb";

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
  const { device_id, user_id } = request.body;

  if (!device_id || !user_id) {
    return response
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
      return response.status(404).json({ message: "Device not found" });
    }

    // Step 2: Verify the device's status
    const deviceData = device.Item;
    if (deviceData.status !== "pending") {
      return response
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
      return response
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
    return response.status(200).json({
      message: "Device registration confirmed successfully.",
      device: updatedDevice.Attributes,
    });
  } catch (error) {
    console.error("Error confirming device registration:", error);
    return response
      .status(500)
      .json({ message: "Failed to confirm registration", error });
  }
};

export const findDevicesByVendor = (vendorId: string): Device[] | undefined => {
  const result: Device[] = [];

  // devices.forEach((device) => {
  //   if (device.vendorId === vendorId) {
  //     result.push(device);
  //   }
  // });

  return result;
};

//TODO: Implement Find device by vendor
export const findDeviceById = (deviceId: string): Device | undefined =>
  undefined;

const createKeysAndCertificates =
  async (): Promise<CreateKeysAndCertificateCommandOutput> => {
    const createKeysAndCertCommand = new CreateKeysAndCertificateCommand({
      setAsActive: false,
    });
    return await iotClient.send(createKeysAndCertCommand);
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
  device_id: string
): Promise<Device | null> => {
  const getParams = {
    TableName: DEVICES_TABLE,
    Key: { device_id },
  };

  // Getting Device Data from DynamoDB
  return getDeviceResultMapper(await docClient.send(new GetCommand(getParams)));
};

const updateDeviceTimestamp = async (
  device_id: String,
  wasProvisioned: Boolean = false
): Promise<Device> => {
  const timestamp = new Date().toISOString();
  let updateParams = {
    TableName: DEVICES_TABLE,
    Key: { device_id },
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
      vendorId: null,

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
