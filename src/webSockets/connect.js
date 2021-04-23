const { create } = require('../services/index');

module.exports.hanlder = async (event) => {
    console.log('event', event);
    const { connectionId: connectionID } = event.requestContext;

    const data = {
        partitionKey: connectionID,
        sortKey: '#socket',
        date: Date.now(),
        meesage: [],
    };
    await create(data);
    return { statusCode: 200, message: 'connected' };
};
