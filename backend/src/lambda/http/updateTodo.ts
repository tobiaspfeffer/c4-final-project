import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'
import { updateToDo } from '../../buisnessLogic/todo'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)
  const todoId = event.pathParameters.todoId
  const userId: string = getUserId(event)
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  try {
    await updateToDo(updatedTodo, userId, todoId)
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
