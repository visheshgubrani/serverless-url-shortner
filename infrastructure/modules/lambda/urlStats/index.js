import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

export const handler = async (event, context) => {
  try {
    const shortId = event.pathParameters?.id
    if (!shortId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'url id is required' }),
      }
    }
    const command = new GetCommand({
      TableName: 'urls',
      Key: { id: shortId },
    })
    const response = await docClient.send(command)

    if (!response.Item) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'URL not found' }),
      }
    }
    const {
      originalUrl,
      shortUrl,
      clicks = 0,
      createdAt,
      lastClickedAt,
      clickHistory = [],
    } = response.Item

    const stats = {
      originalUrl,
      shortUrl,
      clicks,
      createdAt,
      lastClickedAt,
      recentClicks: clickHistory
        .slice(-10)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
      averageClicksPerDay: (
        clicks /
        ((new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24))
      ).toFixed(2),
      daysActive: (
        (new Date() - new Date(createdAt)) /
        (1000 * 60 * 60 * 24)
      ).toFixed(1),
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(stats),
    }
  } catch (error) {
    console.error('Error getting URL stats:', {
      error: error.message,
      shortId: event.pathParameters?.id,
    })

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
