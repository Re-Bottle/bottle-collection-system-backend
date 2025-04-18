import type {
  Device,
  User,
  Reward,
  OTP,
  Scan,
  ScanClaimResponse,
} from "../types/express.js";
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
const SCANS_TABLE = "Scans";
const OTP_TABLE = "OTP";
const CLAIMS_TABLE = "Claims";

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
      totalPoints: 0,
      totalBottles: 0,
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
      id: String(Date.now()),
      email,
      password,
      name,
      totalPoints: 0,
      totalBottles: 0,
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

  async createReward(
    rewardName: string,
    rewardDescription: string,
    rewardPoints: number,
    redeemBy: string
  ): Promise<Reward> {
    const newReward = {
      id: String(Date.now()),
      rewardName: rewardName,
      rewardDescription: rewardDescription,
      rewardPoints: rewardPoints,
      rewardActiveStatus: true,
      redeemBy: redeemBy,
    };
    const params = {
      TableName: REWARDS_TABLE,
      Item: marshall(newReward, { removeUndefinedValues: true }),
    };

    await this.client.send(new PutItemCommand(params));
    return newReward;
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

  async updateReward(
    id: string,
    rewardName: string,
    rewardDescription: string,
    rewardPoints: number,
    redeemBy: string
  ): Promise<boolean> {
    const params = {
      TableName: REWARDS_TABLE,
      Key: marshall({ id }),
      UpdateExpression: `
        SET
          rewardName = :rewardName,
          rewardDescription = :rewardDescription,
          rewardPoints = :rewardPoints,
          redeemBy = :redeemBy
      `,
      ExpressionAttributeValues: marshall({
        ":rewardName": rewardName,
        ":rewardDescription": rewardDescription,
        ":rewardPoints": rewardPoints,
        ":redeemBy": redeemBy,
      }),
      ReturnValues: ReturnValue.ALL_NEW,
    };

    try {
      await this.client.send(new UpdateItemCommand(params));
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async deleteReward(id: string): Promise<boolean> {
    const params = {
      TableName: REWARDS_TABLE,
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

  async createScan(
    deviceId: string,
    scanData: string,
    bottleType: number
  ): Promise<any> {
    const timestamp = new Date().toISOString();
    const claimedBy = "unclaimed";
    const newScan = {
      id: String(Date.now()),
      claimedBy,
      deviceId,
      scanData,
      timestamp,
      bottleType,
    };

    const params = {
      TableName: SCANS_TABLE,
      Item: marshall(newScan, { removeUndefinedValues: true }),
    };

    await this.client.send(new PutItemCommand(params));
    return newScan;
  }

  async getScanByData(scanData: string): Promise<any> {
    const params = {
      TableName: SCANS_TABLE,
      IndexName: "ScanDataIndex",
      KeyConditionExpression: "#scanData = :scanData",
      ExpressionAttributeNames: { "#scanData": "scanData" },
      ExpressionAttributeValues: marshall({ ":scanData": scanData }),
    };

    try {
      const result = await this.client.send(new QueryCommand(params));
      return result.Items?.length
        ? result.Items.map((item) => unmarshall(item))
        : undefined;
    } catch (error) {
      console.error("Error fetching scan by data:", error);
      return undefined;
    }
  }

  async updateScanUserId(
    id: string,
    claimedBy: string
  ): Promise<ScanClaimResponse> {
    // First, get the scan to know the bottle type
    const scan = await this.getScanById(id);
    if (!scan) {
      throw new Error("Scan not found");
    }

    // Update the scan's claimedBy
    const updateScanParams = {
      TableName: SCANS_TABLE,
      Key: marshall({ id }),
      UpdateExpression: "set #claimedBy = :claimedBy",
      ExpressionAttributeNames: {
        "#claimedBy": "claimedBy",
      },
      ExpressionAttributeValues: marshall({
        ":claimedBy": claimedBy,
      }),
      ReturnValues: ReturnValue.ALL_NEW,
    };

    // Calculate points to add, ensure it's a number
    const bottleType = Number(scan.bottleType) || 1;
    const pointsToAdd = bottleType * 1;

    // Update user's points and bottle count
    const updateUserParams = {
      TableName: USERS_TABLE,
      Key: marshall({ id: claimedBy }),
      UpdateExpression: "ADD totalPoints :points, totalBottles :bottles",
      ExpressionAttributeValues: marshall({
        ":points": pointsToAdd,
        ":bottles": 1
      }),
      ReturnValues: ReturnValue.ALL_NEW,
    };

    try {
      // Update both scan and user in parallel
      const [scanResult, userResult] = await Promise.all([
        this.client.send(new UpdateItemCommand(updateScanParams)),
        this.client.send(new UpdateItemCommand(updateUserParams)),
      ]);

      return {
        scan: scanResult.Attributes ? unmarshall(scanResult.Attributes) as Scan : scan,
        user: {
          totalPoints: userResult.Attributes ? (unmarshall(userResult.Attributes).totalPoints || 0) : 0,
          totalBottles: userResult.Attributes ? (unmarshall(userResult.Attributes).totalBottles || 0) : 0,
        },
      };
    } catch (error) {
      console.error("Error updating scan and user:", error);
      throw error;
    }
  }

  async getScansByUser(claimedBy: string): Promise<any> {
    const params = {
      TableName: SCANS_TABLE,
      IndexName: "ClaimedByIndex",
      KeyConditionExpression: "#claimedBy = :claimedBy",
      ExpressionAttributeNames: { "#claimedBy": "claimedBy" },
      ExpressionAttributeValues: marshall({ ":claimedBy": claimedBy }),
    };
    return this.client
      .send(new QueryCommand(params))
      .then((result) =>
        result.Items?.length
          ? result.Items.map((item) => unmarshall(item))
          : undefined
      );
  }

  async getScanById(id: string): Promise<any> {
    const params = {
      TableName: SCANS_TABLE,
      Key: marshall({ id }),
    };

    const result = await this.client.send(new GetItemCommand(params));
    return result.Item ? unmarshall(result.Item) : undefined;
  }

  async deleteScan(id: string): Promise<boolean> {
    const params = {
      TableName: SCANS_TABLE,
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

  async getClaimsByUserId(userId: string): Promise<any[]> {
    const params = {
      TableName: CLAIMS_TABLE,
      IndexName: "UserIdIndex",
      KeyConditionExpression: "#userId = :userId",
      ExpressionAttributeNames: { "#userId": "userId" },
      ExpressionAttributeValues: marshall({ ":userId": userId }),
    };

    try {
      const result = await this.client.send(new QueryCommand(params));
      return result.Items?.length
        ? result.Items.map((item) => unmarshall(item))
        : [];
    } catch (error) {
      console.error("Error fetching claims by user:", error);
      throw error;
    }
  }

  async storeOTP(email: string, otp: string): Promise<OTP> {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    const otpData: OTP = {
      email,
      code: otp,
      expiresAt,
    };

    const params = {
      TableName: OTP_TABLE,
      Item: marshall({
        email,
        code: otp,
        expiresAt: expiresAt.toISOString(),
      }),
    };

    await this.client.send(new PutItemCommand(params));
    return otpData;
  }

  async verifyOTP(email: string, otp: string): Promise<boolean> {
    const params = {
      TableName: OTP_TABLE,
      Key: marshall({ email }),
    };

    const result = await this.client.send(new GetItemCommand(params));
    if (!result.Item) return false;

    const otpRecord = unmarshall(result.Item) as OTP;
    const now = new Date();
    const expiresAt = new Date(otpRecord.expiresAt);

    if (now > expiresAt) {
      await this.deleteOTP(email);
      return false;
    }

    if (otpRecord.code !== otp) {
      return false;
    }

    return true;
  }

  async deleteOTP(email: string): Promise<boolean> {
    const params = {
      TableName: OTP_TABLE,
      Key: marshall({ email }),
    };

    try {
      await this.client.send(new DeleteItemCommand(params));
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async getUserStats(
    userId: string
  ): Promise<{ totalBottles: number; totalPoints: number }> {
    const params = {
      TableName: USERS_TABLE,
      Key: marshall({ id: userId }),
    };

    try {
      const result = await this.client.send(new GetItemCommand(params));
      if (!result.Item) {
        return { totalBottles: 0, totalPoints: 0 };
      }
      const user = unmarshall(result.Item);
      return {
        totalBottles: user.totalBottles || 0,
        totalPoints: user.totalPoints || 0,
      };
    } catch (error) {
      console.error("Error getting user stats:", error);
      throw error;
    }
  }

  async claimReward(userId: string, rewardId: string): Promise<boolean> {
    // First get user stats to check if they have enough points
    const userStats = await this.getUserStats(userId);

    // Get reward details
    const rewardParams = {
      TableName: REWARDS_TABLE,
      Key: marshall({ id: rewardId }),
    };

    try {
      const rewardResult = await this.client.send(
        new GetItemCommand(rewardParams)
      );
      if (!rewardResult.Item) {
        return false;
      }

      const reward = unmarshall(rewardResult.Item);
      if (userStats.totalPoints < reward.rewardPoints) {
        return false; // Not enough points
      }

      // Create claim record
      const claimId = String(Date.now());
      const newClaim = {
        id: claimId,
        userId,
        rewardId,
        rewardPoints: reward.rewardPoints,
        claimedAt: new Date().toISOString(),
        status: "claimed",
      };

      const createClaimParams = {
        TableName: CLAIMS_TABLE,
        Item: marshall(newClaim),
      };

      // Update user's points
      const updateUserParams = {
        TableName: USERS_TABLE,
        Key: marshall({ id: userId }),
        UpdateExpression: "ADD totalPoints :points",
        ExpressionAttributeValues: marshall({
          ":points": -reward.rewardPoints,
        }),
        ReturnValues: ReturnValue.ALL_NEW,
      };

      // Execute both operations
      await Promise.all([
        this.client.send(new PutItemCommand(createClaimParams)),
        this.client.send(new UpdateItemCommand(updateUserParams)),
      ]);

      return true;
    } catch (error) {
      console.error("Error claiming reward:", error);
      return false;
    }
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
      id: result.id || "",
      rewardName: result.rewardName || "",
      rewardDescription: result.rewardDescription || "",
      rewardPoints: result.rewardPoints || 0,
      rewardActiveStatus: result.rewardActiveStatus || false,
      redeemBy: result.redeemBy || "",
    };
  }

  static getScansResultMapper(result: any): any {
    return {
      id: result.id || "",
      claimedBy: result.claimedBy || "",
      deviceId: result.deviceId || "",
      scanData: result.scanData || "",
      timestamp: result.timestamp || new Date(),
      claimed: result.claimed || false,
    };
  }
}
