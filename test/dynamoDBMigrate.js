import { config, DynamoDB } from 'aws-sdk';

config.update({
  region: 'local',
  endpoint: 'http://localhost:8000',
});

const dynamodb = new DynamoDB();

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
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
    },
  ],
};

// Create Scans table
const createScansTableParams = {
  TableName: 'Scans',
  AttributeDefinitions: [
    { AttributeName: 'code', AttributeType: 'S' },
    { AttributeName: 'deviceId', AttributeType: 'S' },
    { AttributeName: 'createdOn', AttributeType: 'N' },
    { AttributeName: 'claimedOn', AttributeType: 'N' },
    { AttributeName: 'claimedBy', AttributeType: 'S' },
    { AttributeName: 'bottleType', AttributeType: 'S' },
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
    { AttributeName: 'rewardName', AttributeType: 'S' },
    { AttributeName: 'rewardDescription', AttributeType: 'S' },
    { AttributeName: 'rewardCost', AttributeType: 'N' },
    { AttributeName: 'validSince', AttributeType: 'N' },
    { AttributeName: 'validUntil', AttributeType: 'N' },
  ],
  KeySchema: [
    { AttributeName: '_id', KeyType: 'HASH' },
  ],
  BillingMode: 'PAY_PER_REQUEST',
};

// Function to create a table
const createTable = (params) => {
  return new Promise((resolve, reject) => {
    dynamodb.createTable(params, (err, data) => {
      if (err) {
        console.error('Unable to create table. Error JSON:', JSON.stringify(err, null, 2));
        reject(err);
      } else {
        console.log('Created table:', JSON.stringify(data, null, 2));
        resolve(data);
      }
    });
  });
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
