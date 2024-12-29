### Install the AWS CLI

Follow the instructions at [AWS Docs](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)

### Start Local DynamoDB Instance:

#### Download DynamoDB Local

[Deploying DynamoDB locally on your computer](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.DownloadingAndRunning.html)

#### Start DynamoDB Local server

`java -D"java.library.path=./DynamoDBLocal_lib" -jar DynamoDBLocal.jar -sharedDb`

### Create Users Table

`aws dynamodb create-table --table-name Users --attribute-definitions AttributeName=id,AttributeType=S AttributeName=email,AttributeType=S --key-schema AttributeName=id,KeyType=HASH --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 --global-secondary-indexes '[{"IndexName": "EmailIndex", "KeySchema": [{"AttributeName": "email", "KeyType": "HASH"}], "Projection": {"ProjectionType": "ALL"}, "ProvisionedThroughput": {"ReadCapacityUnits": 5, "WriteCapacityUnits": 5}}]' --endpoint-url http://localhost:8000`

### Create Vendors Table

`aws dynamodb create-table --table-name Vendors --attribute-definitions AttributeName=id,AttributeType=S AttributeName=email,AttributeType=S --key-schema AttributeName=id,KeyType=HASH --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 --global-secondary-indexes '[{"IndexName": "EmailIndex", "KeySchema": [{"AttributeName": "email", "KeyType": "HASH"}], "Projection": {"ProjectionType": "ALL"}, "ProvisionedThroughput": {"ReadCapacityUnits": 5, "WriteCapacityUnits": 5}}]' --endpoint-url http://localhost:8000`

### Create Devices Table

`aws dynamodb create-table  --table-name Devices  --attribute-definitions      AttributeName=deviceId,AttributeType=S      AttributeName=vendorId,AttributeType=S  --key-schema      AttributeName=deviceId,KeyType=HASH  --billing-mode PAY_PER_REQUEST  --endpoint-url http://localhost:8000  --global-secondary-indexes '[{"IndexName": "VendorIdIndex", "KeySchema": [{"AttributeName": "vendorId", "KeyType": "HASH"} ], "Projection": {"ProjectionType": "ALL"}, "ProvisionedThroughput": {"ReadCapacityUnits": 5, "WriteCapacityUnits": 5}}]'`

### Create Scans Table

`aws dynamodb create-table --table-name Scans --attribute-definitions AttributeName=code,AttributeType=S AttributeName=deviceId,AttributeType=S AttributeName=createdOn,AttributeType=N AttributeName=claimedOn,AttributeType=N AttributeName=claimedBy,AttributeType=S AttributeName=bottleType,AttributeType=S --key-schema AttributeName=code,KeyType=HASH --billing-mode PAY_PER_REQUEST --endpoint-url http://localhost:8000`

### Create Rewards Table

`aws dynamodb create-table --table-name Rewards --attribute-definitions AttributeName=_id,AttributeType=S AttributeName=rewardName,AttributeType=S AttributeName=rewardDescription,AttributeType=S AttributeName=rewardCost,AttributeType=N AttributeName=validSince,AttributeType=N AttributeName=validUntil,AttributeType=N --key-schema AttributeName=_id,KeyType=HASH --billing-mode PAY_PER_REQUEST --endpoint-url http://localhost:8000`

### List Tables

`aws dynamodb list-tables --endpoint-url http://localhost:8000`

### Delete Tables

`aws dynamodb delete-table --table-name Users --endpoint-url http://localhost:8000`
