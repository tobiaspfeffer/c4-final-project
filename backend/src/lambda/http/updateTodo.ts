import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import * as AWS  from 'aws-sdk'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'

const docClient = new AWS.DynamoDB.DocumentClient()
const ToDoTable = process.env.TODO_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)
  const todoId = event.pathParameters.todoId
  const user: string = getUserId(event)
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  try {
    await docClient.update({
      TableName: ToDoTable,
      Key: {
        "userId": user,
        "todoId": todoId
      },
      UpdateExpression: "set #na = :n, dueDate = :d, done = :s",
      ExpressionAttributeValues:{
          ":n": updatedTodo.name,
          ":d": updatedTodo.dueDate,
          ":s": updatedTodo.done
      },
      ExpressionAttributeNames:{
        "#na": "name"
      },
      ReturnValues:"UPDATED_NEW"
    }).promise()
  } catch(e) {
    console.log("Update failed", e.message)
  }


  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      todoId, updatedTodo
    })
  }
}
