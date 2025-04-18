![Build](https://github.com/Re-Bottle/bottle-collection-system-backend/actions/workflows/main.yml/badge.svg)

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

`aws dynamodb create-table --table-name Devices --attribute-definitions AttributeName=id,AttributeType=S      AttributeName=vendorId,AttributeType=S --key-schema AttributeName=id,KeyType=HASH --billing-mode PAY_PER_REQUEST  --endpoint-url http://localhost:8000 --global-secondary-indexes '[{"IndexName": "VendorIdIndex", "KeySchema": [{"AttributeName": "vendorId", "KeyType": "HASH"} ], "Projection": {"ProjectionType": "ALL"}, "ProvisionedThroughput": {"ReadCapacityUnits": 5, "WriteCapacityUnits": 5}}]'`

### Create Scans Table

`aws dynamodb create-table --table-name Scans --attribute-definitions AttributeName=id,AttributeType=S AttributeName=scanData,AttributeType=S AttributeName=claimedBy,AttributeType=S --key-schema AttributeName=id,KeyType=HASH --billing-mode PAY_PER_REQUEST --endpoint-url http://localhost:8000 --global-secondary-indexes '[{"IndexName": "ScanDataIndex","KeySchema": [{"AttributeName": "scanData", "KeyType": "HASH"}],"Projection": {"ProjectionType": "ALL"},"ProvisionedThroughput": {"ReadCapacityUnits": 5,"WriteCapacityUnits": 5}},{"IndexName": "ClaimedByIndex","KeySchema": [{"AttributeName": "claimedBy", "KeyType": "HASH"}],"Projection": {"ProjectionType": "ALL"},"ProvisionedThroughput": {"ReadCapacityUnits": 5,"WriteCapacityUnits": 5}}]'`

### Create Rewards Table

` aws dynamodb create-table --table-name Rewards --attribute-definitions AttributeName=id,AttributeType=S --key-schema AttributeName=id,KeyType=HASH --billing-mode PAY_PER_REQUEST --endpoint-url http://localhost:8000`

### Create Claims Table

`aws dynamodb create-table  --table-name Claims --attribute-definitions AttributeName=id,AttributeType=S AttributeName=rewardId,AttributeType=S AttributeName=rewardCost,AttributeType=N AttributeName=availablePoints,AttributeType=N  --key-schema AttributeName=id,KeyType=HASH --billing-mode PAY_PER_REQUEST --endpoint-url http://localhost:8000 --global-secondary-indexes '[{"IndexName": "UserIdIndex", "KeySchema": [{"AttributeName": "userID", "KeyType": "HASH"} ], "Projection": {"ProjectionType": "ALL"}, "ProvisionedThroughput": {"ReadCapacityUnits": 5, "WriteCapacityUnits": 5}}]'`

### List Tables

`aws dynamodb list-tables --endpoint-url http://localhost:8000`

### Delete Tables

`aws dynamodb delete-table --table-name Users --endpoint-url http://localhost:8000`

### Display Data

`aws dynamodb scan --table-name Users --endpoint-url http://localhost:8000`

### Delete Data

`aws dynamodb delete-item --table-name Users --key '{"id":{"S":"1"}}' --endpoint-url http://localhost:8000`
