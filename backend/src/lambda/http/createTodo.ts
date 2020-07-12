import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { getUserId } from '../utils'
import { createToDo } from '../../buisnessLogic/todo'
import { TodoItem } from '../../models/TodoItem'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)
  
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const userId: string = getUserId(event)

  var item: TodoItem 
  try {
    item = await createToDo(newTodo, userId)
  } catch(e) {
    console.log('Create failed', e.message)
  }

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      item
    })
  }
}
