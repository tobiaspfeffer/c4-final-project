import * as AWS  from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

export class todoAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly ToDoTable = process.env.TODO_TABLE
    ) {}

  async getToDos(user: string): Promise<TodoItem[]> {
    console.log('Getting all ToDos of a user')
    const result = await this.docClient.query({
        TableName: this.ToDoTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': user
        },
        ScanIndexForward: false
      }).promise()
    const items = result.Items
    return items as TodoItem[]
  }

  async createToDos(newTODO: TodoItem): Promise<TodoItem> {
    console.log('Create new ToDo')
    await this.docClient.put({
        TableName: this.ToDoTable,
        Item: newTODO
      }).promise()
    return newTODO
  }

  async deleteToDos(userId: string, todoId: string): Promise<TodoItem> {
    console.log('Delete ToDo')
    const result = await this.docClient.delete({
        TableName: this.ToDoTable,
        Key: {
          "userId": userId,
          "todoId": todoId
        }
      }).promise()
    return result.Attributes as TodoItem
  }

  async updateToDos(todoupdate: TodoUpdate, userId: string, todoId: string): Promise<TodoItem> {
    console.log('Update ToDo')
    const result = await this.docClient.update({
        TableName: this.ToDoTable,
        Key: {
          "userId": userId,
          "todoId": todoId
        },
        UpdateExpression: "set #na = :n, dueDate = :d, done = :s",
        ExpressionAttributeValues:{
            ":n": todoupdate.name,
            ":d": todoupdate.dueDate,
            ":s": todoupdate.done
        },
        ExpressionAttributeNames:{
          "#na": "name"
        },
        ReturnValues:"ALL_NEW"
      }).promise()
      return result.Attributes as TodoItem
  }
}

function createDynamoDBClient() {
  return new AWS.DynamoDB.DocumentClient()
}