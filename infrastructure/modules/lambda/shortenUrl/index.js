import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { v4 as uuid } from 'uuid'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

export const handler = async (event, context) => {
  try {
    // get the content from the request body, event
    const body = JSON.parse(event.body)
    const originalUrl = body.url
    if (!originalUrl) {
      console.log('Url is Missing')
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'Url is Missing' }),
      }
    }
    try {
      // Validate the url
      new URL(originalUrl)
    } catch (error) {
      console.log('Invalid URL format')
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'Invalid URL format' }),
      }
    }
    // generate a short code
    const shortId = uuid().slice(0, 6)
    // Document to send to db
    const command = new PutCommand({
      TableName: 'urls',
      Item: {
        id: shortId,
        originalUrl: originalUrl,
        createdAt: new Date().toISOString(),
        clicks: 0,
        lastClickedAt: null,
        clickHistory: [],
      },
    })
    await docClient.send(command)
    const baseUrl = process.env.BASE_URL || 'https://shrtnn.xyz/r'
    const shortUrl = `${baseUrl}/${shortId}`

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        shortUrl,
        originalUrl,
        id: shortId,
        clicks: 0,
      }),
    }
  } catch (error) {
    console.log('Error', error)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ message: 'Internal server error' }),
    }
  }
}
