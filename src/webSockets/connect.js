const { create } = require('../services/index');
const Responses = require('../modules/socketResponse');

exports.handler = async (event) => {
    console.log('event', event);
    const { connectionId: connectionID, domainName, stage } = event.requestContext;
    const tableName = process.env.SOCKET_TABLE_NAME;
    const data = {
        ID: connectionID,
        date: Date.now(),
        messages: [],
        domainName,
        stage,
    };
    await create({ ...data, tableName });
    return Responses._200({ message: 'connected' });
};
