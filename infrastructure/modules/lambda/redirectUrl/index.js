import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

export const handler = async (event, context) => {
  try {
    console.log('Full event:', JSON.stringify(event, null, 2))

    const shortId = event.pathParameters?.id
    console.log('ShortId:', shortId)

    if (!shortId) {
      console.log('No shortId found in path parameters')
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'Missing URL' }),
      }
    }

    const timestamp = new Date().toISOString()
    const userAgent = event.headers['user-agent'] || ''
    const referer = event.headers['referer'] || ''
    // Handle both HTTP API (v2) and REST API (v1) sourceIp paths
    const ip =
      event.requestContext?.http?.sourceIp ||
      event.requestContext?.identity?.sourceIp ||
      '0.0.0.0'

    console.log('Attempting DynamoDB update for id:', shortId)

    const updateCommand = new UpdateCommand({
      TableName: 'urls',
      Key: {
        id: shortId,
      },
      UpdateExpression:
        'SET clicks = clicks + :inc, lastClickedAt = :timestamp, clickHistory = list_append(if_not_exists(clickHistory, :empty_list), :clickHistory)',
      ExpressionAttributeValues: {
        ':inc': 1,
        ':timestamp': timestamp,
        ':clickHistory': [
          {
            timestamp,
            userAgent,
            referer,
            ip,
          },
        ],
        ':empty_list': [],
      },
      ReturnValues: 'ALL_NEW',
    })

    console.log('Sending DynamoDB command...')
    const updateResponse = await docClient.send(updateCommand)
    console.log('DynamoDB response:', JSON.stringify(updateResponse, null, 2))

    const item = updateResponse.Attributes

    if (!item) {
      console.log('No item found in DynamoDB')
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'URL not found' }),
      }
    }

    console.log('Redirecting to:', item.originalUrl)
    return {
      statusCode: 301,
      headers: {
        Location: item.originalUrl,
        'Access-Control-Allow-Origin': '*',
      },
    }
  } catch (error) {
    console.log('Error:', error)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ message: 'Internal Server Error' }),
    }
  }
}
