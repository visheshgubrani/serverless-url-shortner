import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

const handler = async (event, context) => {
  try {
    const shortId = event.pathParameters.id
    const timestamp = new Date().toISOString()
    const userAgent = event.headers['User-Agent'] || ''
    const referer = event.headers['Referer'] || ''
    const ip = event.requestContext.identity.sourceIp

    const updateCommand = new UpdateCommand({
      TableName: 'urls',
      Key: {
        id: shortId,
      },
      UpdateExpression:
        'SET clicks = clicks + :inc, lastClickedAt = :timestamp, clickHistory =:clickHistory',
      ExpressionAttributeValues: {
        ':inc': 1,
        ':timestamp': timestamp,
        ':clickHistory': docClient.createSet([
          JSON.stringify({
            timestamp,
            userAgent,
            referer,
            ip,
          }),
        ]),
      },
      ReturnValues: 'ALL_NEW',
    })
    const updateResponse = await docClient.send(updateCommand)
    const item = updateResponse.Attributes

    if (!item) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'URL not found' }),
      }
    }
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
