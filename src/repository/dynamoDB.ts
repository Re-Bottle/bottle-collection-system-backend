import {
  DeleteItemCommand,
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
  ReturnValue,
  UpdateItemCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import type { Device, User, Reward } from "../types/express.js";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

import RepositoryInterface from "./repositoryInterface.js";
import {
  GetCommand,
  GetCommandOutput,
  PutCommand,
  PutCommandOutput,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

const USERS_TABLE = "Users";
const VENDORS_TABLE = "Vendors";
const DEVICES_TABLE = "Devices";
const REWARDS_TABLE = "Rewards";

export default class DynamoDB implements RepositoryInterface {
  private static instance: DynamoDB;
  private client: DynamoDBClient;

  private constructor() {
    // Ensure that environment variables are defined and assert non-null values
    const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID!;
    const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY!;
    const region = process.env.AWS_REGION || "ap-south-1"; // Default region if not set

    // Type-checking: Ensure AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are defined
    if (!awsAccessKeyId || !awsSecretAccessKey) {
      console.log(awsAccessKeyId + " : " + awsSecretAccessKey);
      throw new Error(
        "AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY must be set in environment variables."
      );
    }

    this.client = new DynamoDBClient({
      region,
      endpoint: "http://localhost:8000", // Add your endpoint if needed
      credentials: {
        accessKeyId: awsAccessKeyId, // Now treated as a string (non-null)
        secretAccessKey: awsSecretAccessKey, // Now treated as a string (non-null)
      },
    });
  }

  public static getInstance(): DynamoDB {
    if (!DynamoDB.instance) {
      DynamoDB.instance = new DynamoDB();
    }
    return DynamoDB.instance;
  }

  async findVendorByEmail(email: string): Promise<User | undefined> {
    const params = {
      TableName: VENDORS_TABLE,
      IndexName: "EmailIndex",
      KeyConditionExpression: "#email = :email",
      ExpressionAttributeNames: { "#email": "email" },
      ExpressionAttributeValues: marshall({ ":email": email }),
    };

    const result = await this.client.send(new QueryCommand(params));
    return result.Items?.[0]
      ? (unmarshall(result.Items[0]) as User)
      : undefined;
  }

  async findVendorById(id: string): Promise<User | undefined> {
    const params = {
      TableName: VENDORS_TABLE,
      Key: marshall({ id }),
    };

    const result = await this.client.send(new GetItemCommand(params));
    return result.Item ? (unmarshall(result.Item) as User) : undefined;
  }

  async createVendor(
    email: string,
    password: string,
    name: string
  ): Promise<User> {
    const newUser: User = {
      id: String(Date.now()), // Use timestamp as ID
      email,
      password,
      name,
    };

    const params = {
      TableName: VENDORS_TABLE,
      Item: marshall(newUser, { removeUndefinedValues: true }),
    };

    await this.client.send(new PutItemCommand(params));
    return newUser;
  }

  async deleteVendor(vendorId: string): Promise<boolean> {
    const params = {
      TableName: VENDORS_TABLE,
      Key: marshall({ id: vendorId }),
    };

    try {
      await this.client.send(new DeleteItemCommand(params));
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async findUserByEmail(email: string): Promise<User | undefined> {
    const params = {
      TableName: USERS_TABLE,
      IndexName: "EmailIndex", // Ensure you create a GSI for email
      KeyConditionExpression: "#email = :email",
      ExpressionAttributeNames: { "#email": "email" },
      ExpressionAttributeValues: marshall({ ":email": email }),
    };

    const result = await this.client.send(new QueryCommand(params));
    return result.Items?.[0]
      ? (unmarshall(result.Items[0]) as User)
      : undefined;
  }

  async findUserById(id: string): Promise<User | undefined> {
    const params = {
      TableName: USERS_TABLE,
      Key: marshall({ id }),
    };

    const result = await this.client.send(new GetItemCommand(params));
    return result.Item ? (unmarshall(result.Item) as User) : undefined;
  }

  async createUser(
    email: string,
    password: string,
    name: string
  ): Promise<User> {
    const newUser: User = {
      id: String(Date.now()), // Use timestamp as ID
      email,
      password,
      name,
    };

    const params = {
      TableName: USERS_TABLE,
      Item: marshall(newUser),
    };

    await this.client.send(new PutItemCommand(params));
    return newUser;
  }

  async updateUserPassword(
    id: string,
    password: string
  ): Promise<User | undefined> {
    const params = {
      TableName: USERS_TABLE,
      Key: marshall({ id }),
      UpdateExpression: "SET #password = :newPassword",
      ExpressionAttributeNames: {
        "#password": "password",
      },
      ExpressionAttributeValues: marshall({
        ":newPassword": password,
      }),
      ReturnValues: ReturnValue.ALL_NEW,
    };

    const result = await this.client.send(new UpdateItemCommand(params));
    return result.Attributes
      ? (unmarshall(result.Attributes) as User)
      : undefined;
  }

  async updateUserName(id: string, name: string): Promise<User | undefined> {
    const params = {
      TableName: USERS_TABLE,
      Key: marshall({ id }),
      UpdateExpression: "SET #name = :name",
      ExpressionAttributeNames: {
        "#name": "name",
      },
      ExpressionAttributeValues: marshall({
        ":name": name,
      }),
      ReturnValues: ReturnValue.ALL_NEW,
    };

    const result = await this.client.send(new UpdateItemCommand(params));
    return result.Attributes
      ? (unmarshall(result.Attributes) as User)
      : undefined;
  }

  async deleteUser(id: string): Promise<boolean> {
    const params = {
      TableName: USERS_TABLE,
      Key: marshall({ id }),
    };

    try {
      await this.client.send(new DeleteItemCommand(params));
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async registerDevice(
    id: string,
    vendorId: string,
    deviceName: string,
    deviceLocation: string,
    deviceDescription: string
  ): Promise<any> {
    const timestamp = new Date().toISOString();
    const updateParams = {
      TableName: DEVICES_TABLE,
      Key: {
        id, // The partition key of the item
      },
      UpdateExpression: `
      SET
        vendorId = :vendorId,
        deviceName = :deviceName,
        deviceLocation = :deviceLocation,
        deviceDescription = :deviceDescription,
        deviceActiveStatus = :deviceActiveStatus,
        whenClaimed = :whenClaimed,
        lastActveTimestamp = :lastActveTimestamp
    `,
      ExpressionAttributeValues: {
        ":vendorId": vendorId,
        ":deviceName": deviceName,
        ":deviceLocation": deviceLocation,
        ":deviceDescription": deviceDescription,
        ":deviceActiveStatus": false, // Default value
        ":whenClaimed": timestamp,
        ":lastActveTimestamp": timestamp,
      },
      ReturnValues: ReturnValue.ALL_NEW,
    };
    const data = await this.client.send(new UpdateCommand(updateParams));
    return data.Attributes;
  }

  async findDevicesByVendor(vendorId: string): Promise<Device[] | undefined> {
    const params = {
      TableName: DEVICES_TABLE,
      IndexName: "VendorIdIndex",
      KeyConditionExpression: "#vendorId = :vendorId",
      ExpressionAttributeNames: { "#vendorId": "vendorId" },
      ExpressionAttributeValues: marshall({ ":vendorId": vendorId }),
    };
    try {
      const result = await this.client.send(new QueryCommand(params));
      return result.Items?.length
        ? result.Items.map((item) => unmarshall(item) as Device)
        : undefined;
    } catch (error) {
      console.error("Error fetching devices:", error);
      return undefined;
    }
  }

  async findDeviceById(id: string): Promise<Device | undefined> {
    const getParams = {
      TableName: DEVICES_TABLE,
      Key: { id },
    };

    // Getting Device Data from DynamoDB
    return DynamoDButils.getDeviceResultMapper(
      await this.client.send(new GetCommand(getParams))
    );
  }

  async createDevice(id: string, macAddress: string): Promise<void> {
    const timestamp = new Date().toISOString();
    const putParams = {
      TableName: DEVICES_TABLE,
      Item: {
        id,
        macAddress,
        vendorId: "Unclaimed",

        deviceName: null,
        deviceLocation: null,
        deviceFillLevel: 0,
        deviceDescription: null,
        deviceActiveStatus: false,

        whenClaimed: null,
        whenProvisioned: null,

        lastActveTimestamp: timestamp,
      },
    };
    await this.client.send(new PutCommand(putParams));
  }

  async getDevice(id: string): Promise<Device | undefined> {
    {
      const getParams = {
        TableName: DEVICES_TABLE,
        Key: { id },
      };

      // Getting Device Data from DynamoDB
      return DynamoDButils.getDeviceResultMapper(
        await this.client.send(new GetCommand(getParams))
      );
    }
  }

  async updateDeviceTimestamp(
    id: string,
    wasProvisioned: Boolean = false
  ): Promise<Device> {
    const timestamp = new Date().toISOString();
    let updateParams = {
      TableName: DEVICES_TABLE,
      Key: { id },
      UpdateExpression: "set #ts = :lastActveTimestamp",
      ExpressionAttributeNames: {
        "#ts": "lastActveTimestamp",
      },
      ExpressionAttributeValues: {
        ":lastActveTimestamp": timestamp,
      },
      ReturnValues: ReturnValue.ALL_NEW,
    };

    if (wasProvisioned) {
      updateParams = {
        ...updateParams,
        UpdateExpression:
          "set #ts = :lastActveTimestamp, whenProvisioned = :lastActveTimestamp",
        ExpressionAttributeNames: {
          ...updateParams.ExpressionAttributeNames,
        },
      };
    }
    return DynamoDButils.putDeviceResultMapper(
      await this.client.send(new UpdateCommand(updateParams))
    );
  }

  async updateDeviceDetails(
    id: string,
    deviceName: string,
    deviceLocation: string,
    deviceDescription: string
  ): Promise<any> {
    const updateParams = {
      TableName: DEVICES_TABLE,
      Key: {
        id, // The partition key of the item
      },
      UpdateExpression: `
      SET
        deviceName = :deviceName,
        deviceLocation = :deviceLocation,
        deviceDescription = :deviceDescription
         `,
      ExpressionAttributeValues: {
        ":deviceName": deviceName,
        ":deviceLocation": deviceLocation,
        ":deviceDescription": deviceDescription,
      },
      ReturnValues: ReturnValue.ALL_NEW,
    };
    const data = await this.client.send(new UpdateCommand(updateParams));
    return data.Attributes;
  }

  async deleteDevice(id: string): Promise<boolean> {
    const params = {
      TableName: DEVICES_TABLE,
      Key: marshall({ id }),
    };

    try {
      await this.client.send(new DeleteItemCommand(params));
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async getRewards(): Promise<Reward[] | undefined> {
    const params = {
      TableName: REWARDS_TABLE,
    };
    const result = await this.client.send(new ScanCommand(params));
    return result.Items?.length
      ? result.Items.map((item) =>
          DynamoDButils.getRewardsResultMapper(unmarshall(item))
        )
      : undefined;
  }
}

class DynamoDButils {
  static getDeviceResultMapper(result: GetCommandOutput): Device | undefined {
    return result.Item?.id
      ? {
          deviceId: result.Item?.id || "",
          macAddress: result.Item?.macAddress || "",
          vendorId: result.Item?.vendorId || null,
          deviceName: result.Item?.deviceName || null,
          deviceLocation: result.Item?.deviceLocation || null,
          deviceFillLevel: result.Item?.deviceFillLevel || 0,
          deviceDescription: result.Item?.deviceDescription || null,
          deviceActiveStatus: result.Item?.deviceActiveStatus || false,
          whenClaimed: result.Item?.whenClaimed || null,
          whenProvisioned: result.Item?.whenProvisioned || null,
          lastActveTimestamp: result.Item?.lastActveTimestamp || new Date(),
        }
      : undefined;
  }
  static putDeviceResultMapper(result: PutCommandOutput): Device {
    return {
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
      lastActveTimestamp: result.Attributes?.lastActveTimestamp || new Date(),
    };
  }

  static getDevicesResultMapper(result: any): Device {
    return {
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
      lastActveTimestamp: result.lastActveTimestamp || new Date(),
    };
  }

  static getRewardsResultMapper(result: any): Reward {
    return {
      rewardId: result.id || "",
      rewardName: result.rewardName || "",
      rewardDescription: result.rewardDescription || "",
      rewardPoints: result.rewardPoints || 0,
      rewardActiveStatus: result.rewardActiveStatus || false,
    };
  }
}
