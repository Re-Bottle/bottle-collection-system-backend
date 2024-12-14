import { User } from "../types/express";
import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

const dynamoDb = new DynamoDBClient({
  region: "ap-south-1", // Change to your preferred region
  endpoint: "http://localhost:8000", // Local DynamoDB endpoint
});

const USERS_TABLE = "Users";
const VENDORS_TABLE = "Vendors";

// In-memory users "database"
const users: User[] = [];
const vendors: User[] = [];

let userIdCounter = 1;
let vendorIdCounter = 1;

// Create a new Vendor
export const createVendor = async (
  email: string,
  password: string,
  name: string
): Promise<User> => {
  const newUser: User = {
    id: String(Date.now()), // Use timestamp as ID
    email,
    password,
    name,
  };

  const params = {
    TableName: VENDORS_TABLE,
    Item: marshall(newUser),
  };

  await dynamoDb.send(new PutItemCommand(params));
  return newUser;
};

// Find a vendor by email
export const findVendorByEmail = async (
  email: string
): Promise<User | undefined> => {
  const params = {
    TableName: VENDORS_TABLE,
    IndexName: "EmailIndex", // Ensure you create a GSI for email
    KeyConditionExpression: "#email = :email",
    ExpressionAttributeNames: { "#email": "email" },
    ExpressionAttributeValues: marshall({ ":email": email }),
  };

  const result = await dynamoDb.send(new QueryCommand(params));
  return result.Items?.[0] ? (unmarshall(result.Items[0]) as User) : undefined;
};

// Find a vendor by ID
export const findVendorById = async (id: string): Promise<User | undefined> => {
  const params = {
    TableName: VENDORS_TABLE,
    Key: marshall({ id }),
  };

  const result = await dynamoDb.send(new GetItemCommand(params));
  return result.Item ? (unmarshall(result.Item) as User) : undefined;
};

// Create a new user
export const createUser = async (
  email: string,
  password: string,
  name: string
): Promise<User> => {
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

  await dynamoDb.send(new PutItemCommand(params));
  return newUser;
};

// Find a user by email
export const findUserByEmail = async (
  email: string
): Promise<User | undefined> => {
  const params = {
    TableName: USERS_TABLE,
    IndexName: "EmailIndex", // Ensure you create a GSI for email
    KeyConditionExpression: "#email = :email",
    ExpressionAttributeNames: { "#email": "email" },
    ExpressionAttributeValues: marshall({ ":email": email }),
  };

  const result = await dynamoDb.send(new QueryCommand(params));
  return result.Items?.[0] ? (unmarshall(result.Items[0]) as User) : undefined;
};

// Find a user by ID
export const findUserById = async (id: string): Promise<User | undefined> => {
  const params = {
    TableName: USERS_TABLE,
    Key: marshall({ id }),
  };

  const result = await dynamoDb.send(new GetItemCommand(params));
  return result.Item ? (unmarshall(result.Item) as User) : undefined;
};
