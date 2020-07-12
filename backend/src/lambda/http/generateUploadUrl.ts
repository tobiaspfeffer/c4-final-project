import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

import { getUserId } from '../utils'
import * as uuid from 'uuid'

const XAWS = AWSXRay.captureAWS(AWS)
const docClient = new XAWS.DynamoDB.DocumentClient()
const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

const ToDoTable = process.env.TODO_TABLE
const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)
  const todoId = event.pathParameters.todoId
  const userId: string = getUserId(event)

  const validToDoId = await toDoExists(userId, todoId)

  if (!validToDoId) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'ToDo does not exist'
      })
    }
  }

  const imageId: string = uuid.v4()
  const presignedUrl: string = getUploadUrl(imageId)
  const imageUrl = `https://${bucketName}.s3.amazonaws.com/${imageId}`
  console.log('Attachment url: ', imageUrl)

  try {
    await UpdateUrl(userId, todoId, imageUrl)
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
      todoId,
      uploadUrl: presignedUrl
    })
  }
}

async function toDoExists(userId: string, todoId: string): Promise<boolean> {
  const result = await docClient
    .get({
      TableName: ToDoTable,
      Key: {
        "userId": userId,
        "todoId": todoId
      }
    })
    .promise()

  console.log('Get group: ', result)
  return !!result.Item
}

async function UpdateUrl(userId: string, todoId: string, url: string): Promise<boolean> {
  console.log("Updating url")
  const result = await docClient
  .update({
    TableName: ToDoTable,
    Key: {
      "userId": userId,
      "todoId": todoId
    },
    UpdateExpression: "set attachmentUrl = :a",
    ExpressionAttributeValues:{
        ":a": url
    },
    ReturnValues:"ALL_NEW"
  }).promise()
  return !!result
}

function getUploadUrl(imageId: string): string {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: imageId,
    Expires: urlExpiration
  })
}
