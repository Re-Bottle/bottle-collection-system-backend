import {
  DeleteItemCommand,
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
  ReturnValue,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import type { User } from "../types/express.js";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

import RepositoryInterface from "./repositoryInterface.js";

const USERS_TABLE = "Users";
const VENDORS_TABLE = "Vendors";

export default class DynamoDB implements RepositoryInterface {
  private static instance: DynamoDB;
  private client: DynamoDBClient;

  private constructor() {
    this.client = new DynamoDBClient({
      region: "ap-south-1",
      endpoint: "http://localhost:8000",
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
}
