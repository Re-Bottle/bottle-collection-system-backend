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

`aws dynamodb create-table --table-name Devices --attribute-definitions AttributeName=deviceId,AttributeType=S --key-schema AttributeName=deviceId,KeyType=HASH --billing-mode PAY_PER_REQUEST --endpoint-url http://localhost:8000`

### List Tables

`aws dynamodb list-tables --endpoint-url http://localhost:8000`
