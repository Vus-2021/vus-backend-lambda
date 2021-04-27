const AWS = require('aws-sdk');
const WebSocket = require('../modules/websocketMessage');
const Responses = require('../modules/socketResponse');

exports.handler = async (event) => {
    console.log('event', JSON.stringify(event, null, 2));
    const ddb = new AWS.DynamoDB.DocumentClient();
    let connectionData;

    const tableName = process.env.SOCKET_TABLE_NAME;
    try {
        connectionData = await ddb
            .scan({
                TableName: tableName,
            })
            .promise();

        const postCalls = connectionData.Items.map(async (item) => {
            await WebSocket.send({
                domainName: item.domainName,
                stage: item.stage,
                connectionID: item.ID,
                message: event.Records[0].Sns.Message || 'refetch',
            });
        });

        await Promise.all(postCalls);
        return Responses._200({ message: 'got a message' });
    } catch (error) {
        console.log('error', error);
        return Responses._400({ message: 'message could not be received' });
    }
};
