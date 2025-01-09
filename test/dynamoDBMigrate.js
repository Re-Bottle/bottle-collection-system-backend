import { DynamoDBClient, CreateTableCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({
  region: 'local',
  endpoint: 'http://localhost:8000',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
});

// Create Users table
const createUsersTableParams = {
  TableName: 'Users',
  AttributeDefinitions: [
    { AttributeName: 'id', AttributeType: 'S' },
    { AttributeName: 'email', AttributeType: 'S' },
  ],
  KeySchema: [
    { AttributeName: 'id', KeyType: 'HASH' },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5,
  },
  GlobalSecondaryIndexes: [
    {
      IndexName: 'EmailIndex',
      KeySchema: [
        { AttributeName: 'email', KeyType: 'HASH' },
      ],
      Projection: {
        ProjectionType: 'ALL',
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
  TableName: 'Vendors',
  AttributeDefinitions: [
    { AttributeName: 'id', AttributeType: 'S' },
    { AttributeName: 'email', AttributeType: 'S' },
  ],
  KeySchema: [
    { AttributeName: 'id', KeyType: 'HASH' },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5,
  },
  GlobalSecondaryIndexes: [
    {
      IndexName: 'EmailIndex',
      KeySchema: [
        { AttributeName: 'email', KeyType: 'HASH' },
      ],
      Projection: {
        ProjectionType: 'ALL',
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
  TableName: 'Devices',
  AttributeDefinitions: [
    { AttributeName: 'deviceId', AttributeType: 'S' },
    { AttributeName: 'vendorId', AttributeType: 'S' },
  ],
  KeySchema: [
    { AttributeName: 'deviceId', KeyType: 'HASH' },
  ],
  BillingMode: 'PAY_PER_REQUEST',
  GlobalSecondaryIndexes: [
    {
      IndexName: 'VendorIdIndex',
      KeySchema: [
        { AttributeName: 'vendorId', KeyType: 'HASH' },
      ],
      Projection: {
        ProjectionType: 'ALL',
      },
    },
  ],
};

// Create Scans table
const createScansTableParams = {
  TableName: 'Scans',
  AttributeDefinitions: [
    { AttributeName: 'code', AttributeType: 'S' },
  ],
  KeySchema: [
    { AttributeName: 'code', KeyType: 'HASH' },
  ],
  BillingMode: 'PAY_PER_REQUEST',
};

// Create Rewards table
const createRewardsTableParams = {
  TableName: 'Rewards',
  AttributeDefinitions: [
    { AttributeName: '_id', AttributeType: 'S' },
  ],
  KeySchema: [
    { AttributeName: '_id', KeyType: 'HASH' },
  ],
  BillingMode: 'PAY_PER_REQUEST',
};

// Function to create a table
const createTable = async (params) => {
  try {
    const command = new CreateTableCommand(params);
    const data = await client.send(command);
    console.log('Created table:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Unable to create table. Error:', JSON.stringify(err, null, 2));
  }
};

// Create the tables
(async () => {
  try {
    await createTable(createUsersTableParams);
    await createTable(createVendorsTableParams);
    await createTable(createDevicesTableParams);
    await createTable(createScansTableParams);
    await createTable(createRewardsTableParams);
  } catch (error) {
    console.error('Error creating tables:', error);
  }
})();
