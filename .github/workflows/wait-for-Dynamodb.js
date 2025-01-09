// wait-for-dynamodb.js
import { setTimeout } from 'timers/promises'
import { DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb'

const dynamodbClient = new DynamoDBClient({ 
    region: 'ap-south-1',
    endpoint: 'http://localhost:8000',
    credentials: {
        accessKeyId: 'fakeAccessKeyId',
        secretAccessKey: 'fakeSecretAccessKey'
    }    
 })

let iteration = 500;

const waitForDynamoDbToStart = async () => {
    iteration = iteration - 1;

    if (iteration == 0){
        throw new Error("Failed to start DynamoDB");
    }
    try {
        const command = new ListTablesCommand({})
        await dynamodbClient.send(command)
    } catch (error) {
        console.log('Waiting for Docker container to start...')
        await setTimeout(500)
        return waitForDynamoDbToStart()
    }
}

const start = Date.now()
waitForDynamoDbToStart()
    .then(() => {
        console.log(`DynamoDB-local started after ${Date.now() - start}ms.`)
        process.exit(0)
    })
    .catch(error => {
        console.log('Error starting DynamoDB-local!', error)
        process.exit(1)
    })
