// wait-for-dynamodb.js
import { setTimeout } from 'timers/promises'
import { DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb'

const dynamodbClient = new DynamoDBClient({ 
    region: process.env.AWS_REGION,
    endpoint: 'http://localhost:8000',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
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
