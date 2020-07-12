import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import * as AWS  from 'aws-sdk'
import * as uuid from 'uuid'
import { getUserId } from '../utils'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'

const docClient = new AWS.DynamoDB.DocumentClient()
const ToDoTable = process.env.TODO_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)
  
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const itemId: string = uuid.v4()
  let dateTime: string = new Date().toLocaleString()

  const user: string = getUserId(event)

  const newTODO = {
    userId: user,
    todoId: itemId,
    createdAt: dateTime,
    done: false,
    ...newTodo
  }
  try {
    await docClient.put({
      TableName: ToDoTable,
      Item: newTODO
    }).promise()
  } catch(e) {
    console.log(e.message)
  }

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      newTODO
    })
  }
}
