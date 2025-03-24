import {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({
  region: "ap-south-1",
  endpoint: "http://localhost:8000",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Create Users table
const createUsersTableParams = {
  TableName: "Users",
  AttributeDefinitions: [
    { AttributeName: "id", AttributeType: "S" },
    { AttributeName: "email", AttributeType: "S" },
  ],
  KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5,
  },
  GlobalSecondaryIndexes: [
    {
      IndexName: "EmailIndex",
      KeySchema: [{ AttributeName: "email", KeyType: "HASH" }],
      Projection: {
        ProjectionType: "ALL",
      },
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
    },
  ],
};

// Create Vendors table
const createVendorsTableParams = {
  TableName: "Vendors",
  AttributeDefinitions: [
    { AttributeName: "id", AttributeType: "S" },
    { AttributeName: "email", AttributeType: "S" },
  ],
  KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5,
  },
  GlobalSecondaryIndexes: [
    {
      IndexName: "EmailIndex",
      KeySchema: [{ AttributeName: "email", KeyType: "HASH" }],
      Projection: {
        ProjectionType: "ALL",
      },
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
    },
  ],
};

// Create Devices table
const createDevicesTableParams = {
  TableName: "Devices",
  AttributeDefinitions: [
    { AttributeName: "id", AttributeType: "S" },
    { AttributeName: "vendorId", AttributeType: "S" },
  ],
  KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
  BillingMode: "PAY_PER_REQUEST",
  GlobalSecondaryIndexes: [
    {
      IndexName: "VendorIdIndex",
      KeySchema: [{ AttributeName: "vendorId", KeyType: "HASH" }],
      Projection: {
        ProjectionType: "ALL",
      },
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
    },
  ],
};

// Create Scans table
const createScansTableParams = {
  TableName: "Scans",
  AttributeDefinitions: [
    { AttributeName: "id", AttributeType: "S" },
    { AttributeName: "scanData", AttributeType: "S" },
    { AttributeName: "claimedBy", AttributeType: "S" },
  ],
  KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
  BillingMode: "PAY_PER_REQUEST",
  GlobalSecondaryIndexes: [
    {
      IndexName: "ScanDataIndex",
      KeySchema: [{ AttributeName: "scanData", KeyType: "HASH" }],
      Projection: {
        ProjectionType: "ALL",
      },

      IndexName: "ClaimedByIndex",
      KeySchema: [{ AttributeName: "claimedBy", KeyType: "HASH" }],
      Projection: {
        ProjectionType: "ALL",
      },
    },
  ],
};

// Create Rewards table
const createRewardsTableParams = {
  TableName: "Rewards",
  AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
  KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
  BillingMode: "PAY_PER_REQUEST",
};

// Create OTP table
const createOTPTableParams = {
  TableName: "OTP",
  AttributeDefinitions: [{ AttributeName: "email", AttributeType: "S" }],
  KeySchema: [{ AttributeName: "email", KeyType: "HASH" }],
  BillingMode: "PAY_PER_REQUEST",
};

// Function to create a table
const createTable = async (params) => {
  try {
    const command = new CreateTableCommand(params);
    const data = await client.send(command);
    console.log("Created table:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(
      "Unable to create table. Error:",
      JSON.stringify(err, null, 2)
    );
  }
};

// Function to describe a table
const describeTable = async (tableName) => {
  try {
    const command = new DescribeTableCommand({
      TableName: tableName,
    });
    const data = await client.send(command);
    console.log(
      `Table ${tableName} exists:`,
      JSON.stringify(data.Table, null, 2)
    );
  } catch (err) {
    console.error(
      `Unable to describe table ${tableName}. Error:`,
      JSON.stringify(err, null, 2)
    );
  }
};

// Insert record into Vendors table
const insertVendor = async () => {
  const params = {
    TableName: "Vendors",
    Item: {
      id: { S: "vendor1" },
      email: { S: "vendor1@example.com" },
    },
  };
  const command = new PutItemCommand(params);
  await client.send(command);
  console.log("Inserted record into Vendors table");
};

// Create the tables
(async () => {
  try {
    await createTable(createUsersTableParams);
    await createTable(createVendorsTableParams);
    await createTable(createDevicesTableParams);
    await createTable(createScansTableParams);
    await createTable(createRewardsTableParams);
    await createTable(createOTPTableParams);

    // Validate tables existence
    await describeTable("Users");
    await describeTable("Vendors");
    await describeTable("Devices");
    await describeTable("Scans");
    await describeTable("Rewards");
    await describeTable("OTP");

    await insertVendor();

    console.log("All Tables Created and Validated");
  } catch (error) {
    console.error("Error creating tables:", error);
  }
})();
