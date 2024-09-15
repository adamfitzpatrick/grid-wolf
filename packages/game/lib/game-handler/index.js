"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = handler;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const domain_1 = require("@grid-wolf/shared/domain");
const utils_1 = require("@grid-wolf/shared/utils");
const jsonwebtoken_1 = require("jsonwebtoken");
const aws_xray_sdk_1 = require("aws-xray-sdk");
const client = (0, aws_xray_sdk_1.captureAWSv3Client)(new client_dynamodb_1.DynamoDBClient());
let TableName;
const parseAuthToken = (event) => {
    // Auth header is always present because requests are not accepted without it.
    const authHeader = event.headers.Authorization;
    const token = authHeader.replace(/^Bearer\s/, '');
    return (0, jsonwebtoken_1.decode)(token);
};
const handlePutGameOperation = async (event) => {
    console.debug({ operationHandled: 'putGame' });
    const gameDTO = JSON.parse(event.body);
    const { username } = parseAuthToken(event);
    if (username !== gameDTO.userId) {
        console.warn(`Username mismatch: auth user is ${username}, but request was for ${gameDTO.userId}`);
        return {
            statusCode: 400,
            body: 'bad request'
        };
    }
    const command = new client_dynamodb_1.PutItemCommand({
        TableName,
        Item: (0, domain_1.marshallToDAO)(gameDTO)
    });
    return client.send(command).then(() => ({
        statusCode: 202,
        body: 'accepted'
    }));
};
const handleGetGameOperation = async (event) => {
    console.debug({ operationHandled: 'getGame' });
    const gameId = event.pathParameters['gameId'];
    const { username } = parseAuthToken(event);
    const command = new client_dynamodb_1.GetItemCommand({
        TableName,
        Key: {
            pk: { S: `user#${username}` },
            sk: { S: `game#${gameId}` }
        }
    });
    const response = await client.send(command);
    if (!response.Item) {
        return {
            statusCode: 403,
            body: 'forbidden'
        };
    }
    return {
        statusCode: 200,
        body: JSON.stringify((0, domain_1.marshallToDTO)(response.Item))
    };
};
const handleGetGamesOperation = async (event) => {
    console.debug({ operationHandled: 'getGames' });
    const { username } = parseAuthToken(event);
    const command = new client_dynamodb_1.QueryCommand({
        TableName,
        ExpressionAttributeValues: {
            ':pk': { S: `user#${username}` }
        },
        KeyConditionExpression: 'pk = :pk'
    });
    const response = await client.send(command);
    return {
        statusCode: 200,
        body: JSON.stringify(response.Items.map(domain_1.marshallToDTO))
    };
};
async function handler(event) {
    console.info(JSON.stringify(event));
    TableName = process.env[utils_1.EnvironmentVariableName.DATA_TABLE_NAME];
    const { resourcePath, httpMethod } = event.requestContext;
    let returnValue = null;
    if (resourcePath === '/game' && httpMethod === 'PUT') {
        returnValue = await handlePutGameOperation(event);
    }
    else if (resourcePath === '/game/{gameId}' && httpMethod === 'GET') {
        returnValue = await handleGetGameOperation(event);
    }
    else if (resourcePath === '/games' && httpMethod === 'GET') {
        returnValue = await handleGetGamesOperation(event);
    }
    else {
        console.error(`No handler to invoke for path ${resourcePath} and method ${httpMethod}`);
    }
    console.debug({ returnValue });
    return returnValue;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQXFGQSwwQkFrQkM7QUF2R0QsOERBQXdHO0FBQ3hHLHFEQUEwRjtBQUMxRixtREFBa0U7QUFFbEUsK0NBQWtEO0FBQ2xELCtDQUFrRDtBQUdsRCxNQUFNLE1BQU0sR0FBRyxJQUFBLGlDQUFrQixFQUFDLElBQUksZ0NBQWMsRUFBRSxDQUFDLENBQUM7QUFDeEQsSUFBSSxTQUFpQixDQUFDO0FBRXRCLE1BQU0sY0FBYyxHQUFHLENBQUMsS0FBMkIsRUFBRSxFQUFFO0lBQ3JELDhFQUE4RTtJQUM5RSxNQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLGFBQWMsQ0FBQztJQUNoRCxNQUFNLEtBQUssR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNsRCxPQUFPLElBQUEscUJBQU0sRUFBQyxLQUFLLENBQWUsQ0FBQztBQUNyQyxDQUFDLENBQUE7QUFFRCxNQUFNLHNCQUFzQixHQUFHLEtBQUssRUFBRSxLQUEyQixFQUFFLEVBQUU7SUFDbkUsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLGdCQUFnQixFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUM7SUFDL0MsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSyxDQUFZLENBQUM7SUFDbkQsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUUzQyxJQUFJLFFBQVEsS0FBSyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDaEMsT0FBTyxDQUFDLElBQUksQ0FDVixtQ0FBbUMsUUFBUSx5QkFBeUIsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUNyRixDQUFBO1FBQ0QsT0FBTztZQUNMLFVBQVUsRUFBRSxHQUFHO1lBQ2YsSUFBSSxFQUFFLGFBQWE7U0FDcEIs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S0FBSyxLQUFLLEVBQUUsQ0FBQztRQUNyRCxXQUFXLEdBQUcsTUFBTSxzQkFBc0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNwRCxDQUFDO1NBQU0sSUFBSSxZQUFZLEtBQUssZ0JBQWdCLElBQUksVUFBVSxLQUFLLEtBQUssRUFBRSxDQUFDO1FBQ3JFLFdBQVcsR0FBRyxNQUFNLHNCQUFzQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3BELENBQUM7U0FBTSxJQUFJLFlBQVksS0FBSyxRQUFRLElBQUksVUFBVSxLQUFLLEtBQUssRUFBRSxDQUFDO1FBQzdELFdBQVcsR0FBRyxNQUFNLHVCQUF1QixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3JELENBQUM7U0FBTSxDQUFDO1FBQ04sT0FBTyxDQUFDLEtBQUssQ0FBQyxpQ0FBaUMsWUFBWSxlQUFlLFVBQVUsRUFBRSxDQUFDLENBQUE7SUFDekYsQ0FBQztJQUNELE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxXQUFXLEVBQUUsQ0FBQyxDQUFBO0lBQzlCLE9BQU8sV0FBVyxDQUFDO0FBQ3JCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQdXRJdGVtQ29tbWFuZCwgR2V0SXRlbUNvbW1hbmQsIFF1ZXJ5Q29tbWFuZCwgRHluYW1vREJDbGllbnQgfSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWR5bmFtb2RiXCI7XG5pbXBvcnQgeyBHYW1lRFRPLCBHYW1lREFPLCBtYXJzaGFsbFRvREFPLCBtYXJzaGFsbFRvRFRPIH0gZnJvbSBcIkBncmlkLXdvbGYvc2hhcmVkL2RvbWFpblwiO1xuaW1wb3J0IHsgRW52aXJvbm1lbnRWYXJpYWJsZU5hbWUgfSBmcm9tIFwiQGdyaWQtd29sZi9zaGFyZWQvdXRpbHNcIjtcbmltcG9ydCB7IEFQSUdhdGV3YXlQcm94eUV2ZW50IH0gZnJvbSBcImF3cy1sYW1iZGFcIjtcbmltcG9ydCB7IGRlY29kZSwgSnd0UGF5bG9hZCB9IGZyb20gJ2pzb253ZWJ0b2tlbic7XG5pbXBvcnQgeyBjYXB0dXJlQVdTdjNDbGllbnQgfSBmcm9tICdhd3MteHJheS1zZGsnO1xuaW1wb3J0IHsgQ2FsbEFwaUdhdGV3YXlSZXN0QXBpRW5kcG9pbnRQcm9wcyB9IGZyb20gXCJhd3MtY2RrLWxpYi9hd3Mtc3RlcGZ1bmN0aW9ucy10YXNrc1wiO1xuXG5jb25zdCBjbGllbnQgPSBjYXB0dXJlQVdTdjNDbGllbnQobmV3IER5bmFtb0RCQ2xpZW50KCkpO1xubGV0IFRhYmxlTmFtZTogc3RyaW5nO1xuXG5jb25zdCBwYXJzZUF1dGhUb2tlbiA9IChldmVudDogQVBJR2F0ZXdheVByb3h5RXZlbnQpID0+IHtcbiAgLy8gQXV0aCBoZWFkZXIgaXMgYWx3YXlzIHByZXNlbnQgYmVjYXVzZSByZXF1ZXN0cyBhcmUgbm90IGFjY2VwdGVkIHdpdGhvdXQgaXQuXG4gIGNvbnN0IGF1dGhIZWFkZXIgPSBldmVudC5oZWFkZXJzLkF1dGhvcml6YXRpb24hO1xuICBjb25zdCB0b2tlbiA9IGF1dGhIZWFkZXIucmVwbGFjZSgvXkJlYXJlclxccy8sICcnKTtcbiAgcmV0dXJuIGRlY29kZSh0b2tlbikgYXMgSnd0UGF5bG9hZDtcbn1cblxuY29uc3QgaGFuZGxlUHV0R2FtZU9wZXJhdGlvbiA9IGFzeW5jIChldmVudDogQVBJR2F0ZXdheVByb3h5RXZlbnQpID0+IHtcbiAgY29uc29sZS5kZWJ1Zyh7IG9wZXJhdGlvbkhhbmRsZWQ6ICdwdXRHYW1lJyB9KTtcbiAgY29uc3QgZ2FtZURUTyA9IEpTT04ucGFyc2UoZXZlbnQuYm9keSEpIGFzIEdhbWVEVE87XG4gIGNvbnN0IHsgdXNlcm5hbWUgfSA9IHBhcnNlQXV0aFRva2VuKGV2ZW50KTtcblxuICBpZiAodXNlcm5hbWUgIT09IGdhbWVEVE8udXNlcklkKSB7XG4gICAgY29uc29sZS53YXJuKFxuICAgICAgYFVzZXJuYW1lIG1pc21hdGNoOiBhdXRoIHVzZXIgaXMgJHt1c2VybmFtZX0sIGJ1dCByZXF1ZXN0IHdhcyBmb3IgJHtnYW1lRFRPLnVzZXJJZH1gXG4gICAgKVxuICAgIHJldHVybiB7XG4gICAgICBzdGF0dXNDb2RlOiA0MDAsXG4gICAgICBib2R5OiAnYmFkIHJlcXVlc3QnXG4gICAgfTtcbiAgfVxuICBjb25zdCBjb21tYW5kID0gbmV3IFB1dEl0ZW1Db21tYW5kKHtcbiAgICBUYWJsZU5hbWUsXG4gICAgSXRlbTogbWFyc2hhbGxUb0RBTyhnYW1lRFRPKVxuICB9KTtcbiAgcmV0dXJuIGNsaWVudC5zZW5kKGNvbW1hbmQpLnRoZW4oKCkgPT4gKHtcbiAgICBzdGF0dXNDb2RlOiAyMDIsXG4gICAgYm9keTogJ2FjY2VwdGVkJ1xuICB9KSk7XG59XG5cbmNvbnN0IGhhbmRsZUdldEdhbWVPcGVyYXRpb24gPSBhc3luYyAoZXZlbnQ6IEFQSUdhdGV3YXlQcm94eUV2ZW50KSA9PiB7XG4gIGNvbnNvbGUuZGVidWcoeyBvcGVyYXRpb25IYW5kbGVkOiAnZ2V0R2FtZScgfSk7XG4gIGNvbnN0IGdhbWVJZCA9IGV2ZW50LnBhdGhQYXJhbWV0ZXJzIVsnZ2FtZUlkJ107XG4gIGNvbnN0IHsgdXNlcm5hbWUgfSA9IHBhcnNlQXV0aFRva2VuKGV2ZW50KTtcblxuICBjb25zdCBjb21tYW5kID0gbmV3IEdldEl0ZW1Db21tYW5kKHtcbiAgICBUYWJsZU5hbWUsXG4gICAgS2V5OiB7XG4gICAgICBwazogeyBTOiBgdXNlciMke3VzZXJuYW1lfWAgfSxcbiAgICAgIHNrOiB7IFM6IGBnYW1lIyR7Z2FtZUlkfWAgfVxuICAgIH1cbiAgfSk7XG4gIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgY2xpZW50LnNlbmQoY29tbWFuZCk7XG4gIGlmICghcmVzcG9uc2UuSXRlbSkge1xuICAgIHJldHVybiB7XG4gICAgICBzdGF0dXNDb2RlOiA0MDMsXG4gICAgICBib2R5OiAnZm9yYmlkZGVuJ1xuICAgIH1cbiAgfVxuICByZXR1cm4ge1xuICAgIHN0YXR1c0NvZGU6IDIwMCxcbiAgICBib2R5OiBKU09OLnN0cmluZ2lmeShtYXJzaGFsbFRvRFRPKHJlc3BvbnNlLkl0ZW0gYXMgYW55IGFzIEdhbWVEQU8pKVxuICB9O1xufVxuXG5jb25zdCBoYW5kbGVHZXRHYW1lc09wZXJhdGlvbiA9IGFzeW5jIChldmVudDogQVBJR2F0ZXdheVByb3h5RXZlbnQpID0+IHtcbiAgY29uc29sZS5kZWJ1Zyh7IG9wZXJhdGlvbkhhbmRsZWQ6ICdnZXRHYW1lcycgfSk7XG4gIGNvbnN0IHsgdXNlcm5hbWUgfSA9IHBhcnNlQXV0aFRva2VuKGV2ZW50KTtcblxuICBjb25zdCBjb21tYW5kID0gbmV3IFF1ZXJ5Q29tbWFuZCh7XG4gICAgVGFibGVOYW1lLFxuICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IHtcbiAgICAgICc6cGsnOiB7IFM6IGB1c2VyIyR7dXNlcm5hbWV9YH1cbiAgICB9LFxuICAgIEtleUNvbmRpdGlvbkV4cHJlc3Npb246ICdwayA9IDpwaydcbiAgfSk7XG4gIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgY2xpZW50LnNlbmQoY29tbWFuZCk7XG4gIHJldHVybiB7XG4gICAgc3RhdHVzQ29kZTogMjAwLFxuICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KChyZXNwb25zZS5JdGVtcyBhcyBhbnkgYXMgR2FtZURBT1tdKS5tYXAobWFyc2hhbGxUb0RUTykpXG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIoZXZlbnQ6IEFQSUdhdGV3YXlQcm94eUV2ZW50KSB7XG4gIGNvbnNvbGUuaW5mbyhKU09OLnN0cmluZ2lmeShldmVudCkpO1xuXG4gIFRhYmxlTmFtZSA9IHByb2Nlc3MuZW52W0Vudmlyb25tZW50VmFyaWFibGVOYW1lLkRBVEFfVEFCTEVfTkFNRV0hO1xuICBjb25zdCB7IHJlc291cmNlUGF0aCwgaHR0cE1ldGhvZCB9ID0gZXZlbnQucmVxdWVzdENvbnRleHQ7XG5cbiAgbGV0IHJldHVyblZhbHVlOiBvYmplY3QgfCBudWxsID0gbnVsbDtcbiAgaWYgKHJlc291cmNlUGF0aCA9PT0gJy9nYW1lJyAmJiBodHRwTWV0aG9kID09PSAnUFVUJykge1xuICAgIHJldHVyblZhbHVlID0gYXdhaXQgaGFuZGxlUHV0R2FtZU9wZXJhdGlvbihldmVudCk7XG4gIH0gZWxzZSBpZiAocmVzb3VyY2VQYXRoID09PSAnL2dhbWUve2dhbWVJZH0nICYmIGh0dHBNZXRob2QgPT09ICdHRVQnKSB7XG4gICAgcmV0dXJuVmFsdWUgPSBhd2FpdCBoYW5kbGVHZXRHYW1lT3BlcmF0aW9uKGV2ZW50KTtcbiAgfSBlbHNlIGlmIChyZXNvdXJjZVBhdGggPT09ICcvZ2FtZXMnICYmIGh0dHBNZXRob2QgPT09ICdHRVQnKSB7XG4gICAgcmV0dXJuVmFsdWUgPSBhd2FpdCBoYW5kbGVHZXRHYW1lc09wZXJhdGlvbihldmVudCk7XG4gIH0gZWxzZSB7XG4gICAgY29uc29sZS5lcnJvcihgTm8gaGFuZGxlciB0byBpbnZva2UgZm9yIHBhdGggJHtyZXNvdXJjZVBhdGh9IGFuZCBtZXRob2QgJHtodHRwTWV0aG9kfWApXG4gIH1cbiAgY29uc29sZS5kZWJ1Zyh7IHJldHVyblZhbHVlIH0pXG4gIHJldHVybiByZXR1cm5WYWx1ZTtcbn1cbiJdfQ==