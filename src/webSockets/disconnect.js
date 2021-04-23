const { deleteItem } = require('../services/index');

module.exports.hanlder = async (event) => {
    console.log('event', event);
    const { connectionId: connectionID } = event.requestContext;

    const data = {
        primaryKey: {
            partitionKey: connectionID,
            sortKey: '#socket',
        },
    };
    await deleteItem(data);
    return { statusCode: 200, message: 'connected' };
};
