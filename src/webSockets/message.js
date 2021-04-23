const { get, create } = require('../services/index');
const WebSocket = require('../modules/websocketMessage');
const Responses = require('../modules/socketResponse');

exports.handler = async (event) => {
    console.log('event', event);
    const { connectionId: connectionID } = event.requestContext;

    const body = JSON.parse(event.body);

    const tableName = process.env.SOCKET_TABLE_NAME;
    try {
        const { data: record } = await get({
            ID: connectionID,
            tableName,
        });

        const { messages, domainName, stage } = record;

        messages.push(body.message);

        const data = {
            ...record,
            messages,
        };

        await create({ ...data, tableName });

        await WebSocket.send({
            domainName,
            stage,
            connectionID,
            message: 'This is a reply to your message',
        });
        return Responses._200({ message: 'got a message' });
    } catch (error) {
        return Responses._400({ message: 'message could not be received' });
    }
};
