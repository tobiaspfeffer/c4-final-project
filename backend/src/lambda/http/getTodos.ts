import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS  from 'aws-sdk'
import { getUserId } from '../utils'

const docClient = new AWS.DynamoDB.DocumentClient()
const ToDoTable = process.env.TODO_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)
  const user: string = getUserId(event)
  var result
  try {
    result = await docClient.query({
      TableName: ToDoTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': user
      },
      ScanIndexForward: false
    }).promise()
  } catch(e) {
    console.log(e.message)
    return
  }

  const items = result.Items

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items
    })
  }
}