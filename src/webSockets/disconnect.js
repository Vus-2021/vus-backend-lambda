const { deleteItem } = require('../services/index');
const Responses = require('../modules/socketResponse');

exports.handler = async (event) => {
    console.log('event', event);
    const { connectionId: connectionID } = event.requestContext;
    const tableName = process.env.SOCKET_TABLE_NAME;

    await deleteItem({ ID: connectionID, tableName });
    return Responses._200({ message: 'disconnected' });
};
