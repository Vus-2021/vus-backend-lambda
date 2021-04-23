const { get, create } = require('../services/index');

module.exports.hanlder = async (event) => {
    console.log('event', event);
    const { connectionId: connectionID } = event.requestContext;

    const body = JSON.parse(event.body);

    try {
        const record = await get({
            partitionKey: connectionID,
            sortKey: '#socket',
        });
        const messages = record.messages;

        messages.push(body.message);
        const data = {
            ...record,
            messages,
        };

        await create(data);
        return { statusCode: 200, message: 'got a message' };
    } catch (error) {
        return { statusCode: 500, message: 'message 전달 실패' };
    }
};
