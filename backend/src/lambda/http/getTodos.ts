import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getUserId } from '../utils'
import { getToDos } from '../../buisnessLogic/todo'
import { TodoItem } from '../../models/TodoItem'


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)
  const userId: string = getUserId(event)

  var items: TodoItem[]
  try {
    items = await getToDos(userId)
  } catch(e) {
    console.log(e.message)
    return
  }

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