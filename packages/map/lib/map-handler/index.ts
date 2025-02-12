import { MapItem, MapDTO, mapMapper } from '../map-dto';
import { EnvironmentVariableName } from '@grid-wolf/shared/utils';
import { getSignedUrl as getCdnSignedUrl } from '@aws-sdk/cloudfront-signer';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { decode, JwtPayload } from 'jsonwebtoken';
import fetch from 'node-fetch';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl as getS3SignedUrl } from '@aws-sdk/s3-request-presigner'
import { DynamoItemDao } from 'stepinto-aws-tools/clients';

interface Secret {
  SecretString: string;
}
interface PrivateKeySecretString {
  'cdn-private-key': string;
}
const tableName = process.env[EnvironmentVariableName.DATA_TABLE_NAME];
const dao = new DynamoItemDao<MapItem, MapDTO>(tableName!, mapMapper);
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
  const mapDTO = JSON.parse(event.body!) as MapDTO;
  const { username } = parseAuthToken(event);

  if (username !== mapDTO.ownerId) {
    return mismatchedUserRejection(username, mapDTO.ownerId);
  }
  return dao.put(mapDTO).then(() => addCORS({
    statusCode: 202,
    body: 'accepted'
  }));
};

const handleGetMapOperation = async (event: APIGatewayProxyEvent) => {
  console.debug({ operationHandled: 'getMap' });
  const mapId = event.pathParameters!['mapId']!;
  const { username } = parseAuthToken(event);

  let map = await dao.get(username, mapId);
  if (!map) {
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

const handleDeleteMapOperation = async (event: APIGatewayProxyEvent) => {
  console.debug({ operationHandled: 'deleteMap'});
  const { username } = parseAuthToken(event);
  const mapId = event.pathParameters!['mapId']!;

  return dao.delete(username, mapId).then(() => addCORS({
    statusCode: 202,
    body: 'accepted'
  }));
}

const handleGetMapsOperation = async (event: APIGatewayProxyEvent) => {
  console.debug({ operationHandled: 'getMaps' });
  const { username } = parseAuthToken(event);

  let maps = await dao.getAll(username);
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
  const cdnHost = process.env['CDN_HOST']!;

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

  const url = `https://${cdnHost}/${userId}`;
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
  if (resourcePath === '/' && httpMethod === 'PUT') {
    returnValue = await handlePutMapOperation(event);
  } else if (resourcePath === '/{mapId}' && httpMethod === 'GET') {
    returnValue = await handleGetMapOperation(event);
  } else if ((resourcePath === '/{mapId}' && httpMethod === 'DELETE')) {
    returnValue = await handleDeleteMapOperation(event);
  } else if (resourcePath === '/list' && httpMethod === 'GET') {
    returnValue = await handleGetMapsOperation(event);
  } else if (resourcePath === '/save-image-url/{userId}/{filename}' && httpMethod === 'GET') {
    returnValue = await handleGetMapSaveImageUrlOperation(event);
  } else if (resourcePath === '/image-url/{userId}' && httpMethod === 'GET') {
    returnValue = await handleGetMapImageUrlOperation(event);
  } else {
    throw new Error(`No handler to invoke for path ${resourcePath} and method ${httpMethod}`)
  }
  console.debug({ returnValue });
  return returnValue;
}
