@echo off
echo Deleting and recreating DynamoDB tables...

REM Function to delete a table if it exists
call :delete_table Users
call :delete_table Vendors
call :delete_table Devices

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
