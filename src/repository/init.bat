@echo off
echo Deleting and recreating DynamoDB tables...

REM Function to delete a table if it exists
call :delete_table Users
call :delete_table Vendors
call :delete_table Devices
call :delete_table Scans
call :delete_table OTP

REM Create Users table
echo Creating Users table...
aws dynamodb create-table --table-name Users --attribute-definitions AttributeName=id,AttributeType=S AttributeName=email,AttributeType=S --key-schema AttributeName=id,KeyType=HASH --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 --global-secondary-indexes "[{\"IndexName\": \"EmailIndex\", \"KeySchema\": [{\"AttributeName\": \"email\", \"KeyType\": \"HASH\"}], \"Projection\": {\"ProjectionType\": \"ALL\"}, \"ProvisionedThroughput\": {\"ReadCapacityUnits\": 5, \"WriteCapacityUnits\": 5}}]" --endpoint-url http://localhost:8000 >nul 2>&1
call :verify_table_creation Users

REM Create Vendors table
echo Creating Vendors table...
aws dynamodb create-table --table-name Vendors --attribute-definitions AttributeName=id,AttributeType=S AttributeName=email,AttributeType=S --key-schema AttributeName=id,KeyType=HASH --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 --global-secondary-indexes "[{\"IndexName\": \"EmailIndex\", \"KeySchema\": [{\"AttributeName\": \"email\", \"KeyType\": \"HASH\"}], \"Projection\": {\"ProjectionType\": \"ALL\"}, \"ProvisionedThroughput\": {\"ReadCapacityUnits\": 5, \"WriteCapacityUnits\": 5}}]" --endpoint-url http://localhost:8000 >nul 2>&1
call :verify_table_creation Vendors

REM Create Devices table
echo Creating Devices table...
aws dynamodb create-table --table-name Devices --attribute-definitions AttributeName=id,AttributeType=S AttributeName=vendorId,AttributeType=S --key-schema AttributeName=id,KeyType=HASH --billing-mode PAY_PER_REQUEST --endpoint-url http://localhost:8000 --global-secondary-indexes "[{\"IndexName\": \"VendorIdIndex\", \"KeySchema\": [{\"AttributeName\": \"vendorId\", \"KeyType\": \"HASH\"}], \"Projection\": {\"ProjectionType\": \"ALL\"}, \"ProvisionedThroughput\": {\"ReadCapacityUnits\": 5, \"WriteCapacityUnits\": 5}}]" >nul 2>&1
call :verify_table_creation Devices

REM Create Scans table
echo Creating Scans table...
aws dynamodb create-table --table-name Scans --attribute-definitions AttributeName=id,AttributeType=S AttributeName=scanData,AttributeType=S AttributeName=claimedBy,AttributeType=S --key-schema AttributeName=id,KeyType=HASH --billing-mode PAY_PER_REQUEST --endpoint-url http://localhost:8000 --global-secondary-indexes "[{\"IndexName\": \"ScanDataIndex\",\"KeySchema\": [{\"AttributeName\": \"scanData\", \"KeyType\": \"HASH\"}],\"Projection\": {\"ProjectionType\": \"ALL\"},\"ProvisionedThroughput\": {\"ReadCapacityUnits\": 5,\"WriteCapacityUnits\": 5}},{\"IndexName\": \"ClaimedByIndex\",\"KeySchema\": [{\"AttributeName\": \"claimedBy\", \"KeyType\": \"HASH\"}],\"Projection\": {\"ProjectionType\": \"ALL\"},\"ProvisionedThroughput\": {\"ReadCapacityUnits\": 5,\"WriteCapacityUnits\": 5}}]" >nul 2>&1
call :verify_table_creation Scans

REM Create OTP table
echo Creating OTP table...
aws dynamodb create-table --table-name OTP --attribute-definitions AttributeName=email,AttributeType=S --key-schema AttributeName=email,KeyType=HASH --billing-mode PAY_PER_REQUEST --endpoint-url http://localhost:8000 >nul 2>&1
call :verify_table_creation OTP

REM Create Claims table
echo Creating Claims table...
aws dynamodb create-table --table-name Claims --attribute-definitions AttributeName=id,AttributeType=S AttributeName=userId,AttributeType=S --key-schema AttributeName=id,KeyType=HASH --billing-mode PAY_PER_REQUEST --endpoint-url http://localhost:8000 --global-secondary-indexes "[{\"IndexName\": \"UserIdIndex\", \"KeySchema\": [{\"AttributeName\": \"userId\", \"KeyType\": \"HASH\"}], \"Projection\": {\"ProjectionType\": \"ALL\"}, \"ProvisionedThroughput\": {\"ReadCapacityUnits\": 5, \"WriteCapacityUnits\": 5}}]" >nul 2>&1
call :verify_table_creation Claims

echo All tables recreated successfully.
exit /b 0

:delete_table
echo Deleting table %1 if it exists...
aws dynamodb delete-table --table-name %1 --endpoint-url http://localhost:8000 >nul 2>&1
exit /b

:verify_table_creation
aws dynamodb describe-table --table-name %1 --endpoint-url http://localhost:8000 >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo Table %1 created successfully.
) else (
    echo Failed to create table %1.
    exit /b 1
)
exit /b
