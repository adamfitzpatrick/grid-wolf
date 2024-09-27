import { MapDTO } from '@grid-wolf/shared/domain';
import { DynamoClient, EnvironmentVariableName } from '@grid-wolf/shared/utils';
import { getSignedUrl as getCdnSignedUrl } from '@aws-sdk/cloudfront-signer';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { decode, JwtPayload } from 'jsonwebtoken';
import fetch from 'node-fetch';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl as getS3SignedUrl } from '@aws-sdk/s3-request-presigner'

interface Secret {
  SecretString: string;
}
interface PrivateKeySecretString {
  'cdn-private-key': string;
}

const dynamoClient = new DynamoClient<MapDTO>('MapDTO');
const s3Client = new S3Client();

const SESSION_TOKEN = process.env['AWS_SESSION_TOKEN']!
const SECRETS_EXTENSION_HTTP_PORT = 2773
const getSecretUrl = (secretId: string) => {
  return `http://localhost:${SECRETS_EXTENSION_HTTP_PORT}/secretsmanager/get?secretId=${secretId}`;
}

const parseAuthToken = (event: APIGatewayProxyEvent) => {
  // Auth header is always present because requests are not accepted without it.
  const authHeader = event.headers.Authorization!;
  const token = authHeader.replace(/^Bearer\s/, '');
  return decode(token) as JwtPayload;
};

const mismatchedUserRejection = (authUser: string, requestedUser: string) => {
  console.warn(
    `Username mismatch: auth user is ${authUser}, but request was for ${requestedUser}`
  )
  return addCORS({
    statusCode: 400,
    body: 'bad request'
  });
}

const addCORS = (baseResponse: object) => {
  return {
    ...baseResponse,
    headers: {
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Origin': '*',
    }
  }
}

const handlePutMapOperation = async (event: APIGatewayProxyEvent) => {
  console.debug({ operationHandled: 'putMap' });
  const gameDTO = JSON.parse(event.body!) as MapDTO;
  const { username } = parseAuthToken(event);

  if (username !== gameDTO.userId) {
    return mismatchedUserRejection(username, gameDTO.userId);
  }
  return dynamoClient.put(gameDTO).then(() => addCORS({
    statusCode: 202,
    body: 'accepted'
  }));
};

const handleGetMapOperation = async (event: APIGatewayProxyEvent) => {
  console.debug({ operationHandled: 'getMap' });
  const mapId = event.pathParameters!['mapId']!;
  const { username } = parseAuthToken(event);

  let map: MapDTO;
  try {
    map = await dynamoClient.get(username, mapId);
  } catch (e) {
    return addCORS({
      statusCode: 403,
      body: 'forbidden'
    })
  }
  return addCORS({
    statusCode: 200,
    body: JSON.stringify(map)
  });
};

const handleGetMapsOperation = async (event: APIGatewayProxyEvent) => {
  console.debug({ operationHandled: 'getMaps' });
  const { username } = parseAuthToken(event);

  let maps;
  try {
    maps = await dynamoClient.list(username);
  } catch (e) {
    console.error(`Error getting game list for ${username}: ${e}`)
    return addCORS({
      statusCode: 500,
      body: 'Internal server error'
    })
  }
  return addCORS({
    statusCode: 200,
    body: JSON.stringify(maps)
  });
};

const handleGetMapSaveImageUrlOperation = async (event: APIGatewayProxyEvent) => {
  console.debug({ operationHandled: 'getMapSaveImageUrl'});

  const { username } = parseAuthToken(event);
  const userId = event.pathParameters!.userId!;
  const filename = event.pathParameters!.filename!;
  if (username !== userId) {
    return mismatchedUserRejection(username, userId);
  }
  
  const Bucket = process.env[EnvironmentVariableName.IMAGE_BUCKET_NAME]!;
  const Key = `${userId}/${filename}`;
  const command = new PutObjectCommand({ Bucket, Key });
  const url = await getS3SignedUrl(s3Client, command, { expiresIn: 3600 });

  return addCORS({
    statusCode: 200,
    body: JSON.stringify({ userId, filename, url })
  });
}

const handleGetMapImageUrlOperation = async (event: APIGatewayProxyEvent) => {
  console.debug({ operationHandled: 'getMapImageUrl'});

  const { username } = parseAuthToken(event);
  const userId = event.pathParameters!.userId!;
  if (username !== userId) {
    return mismatchedUserRejection(username, userId);
  }

  const keyPairId = process.env[EnvironmentVariableName.CDN_PUBLIC_KEY_ID]!;
  const secretId = process.env[EnvironmentVariableName.CDN_PRIVATE_KEY_SECRET_ID]!;
  const cdnHost = process.env[EnvironmentVariableName.CDN_HOST]!;

  const response = await fetch(getSecretUrl(secretId), {
    headers: {
      'X-AWS-Parameters-Secrets-Token': SESSION_TOKEN
    }
  });
  const secret = (await response.json()) as Secret;
  const secretString = secret.SecretString;
  const privateKey = Buffer.from(
    (JSON.parse(secretString) as PrivateKeySecretString)['cdn-private-key'], 'base64'
  ).toString();

  const url = `${cdnHost}/${userId}`;
  const epochTime = new Date().getTime() + 60 * 60 * 1000;
  const policy = JSON.stringify({
    Statement: [{
      Resource: `${url}/*`,
      Condition: {
        DateLessThan: { 'AWS:EpochTime': epochTime }
      }
    }]
  });

  const signedUrl = new URL(getCdnSignedUrl({
    keyPairId,
    privateKey,
    url,
    policy
  }));
  return addCORS({
    statusCode: 200,
    body: JSON.stringify({
      userId,
      policy: signedUrl.searchParams.get('Policy'),
      keyPairId: signedUrl.searchParams.get('Key-Pair-Id'),
      signature: signedUrl.searchParams.get('Signature')
    })
  });
}

export async function handler(event: APIGatewayProxyEvent) {
  console.info(JSON.stringify(event));
  const { resourcePath, httpMethod } = event.requestContext;

  let returnValue: object | null = null;
  if (resourcePath === '/map' && httpMethod === 'PUT') {
    returnValue = await handlePutMapOperation(event);
  } else if (resourcePath === '/map/{mapId}' && httpMethod === 'GET') {
    returnValue = await handleGetMapOperation(event);
  } else if (resourcePath === '/maps' && httpMethod === 'GET') {
    returnValue = await handleGetMapsOperation(event);
  } else if (resourcePath === '/map/save-image-url/{userId}/{filename}' && httpMethod === 'GET') {
    returnValue = await handleGetMapSaveImageUrlOperation(event);
  } else if (resourcePath === '/map/image-url/{userId}' && httpMethod === 'GET') {
    returnValue = await handleGetMapImageUrlOperation(event);
  } else {
    console.error(`No handler to invoke for path ${resourcePath} and method ${httpMethod}`)
  }
  console.debug({ returnValue })
  return returnValue;
}
