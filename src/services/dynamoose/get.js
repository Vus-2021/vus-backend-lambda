/* eslint-disable no-unused-vars */
const vus = require('../../model/dynamoose');

const get = async ({ tableName, ...args }) => {
    try {
        console.log(vus);
        const data = await vus.get(args);
        return { success: true, message: 'get success', code: 200, data };
    } catch (error) {
        console.log(error);
        return { success: false, message: error.message, code: 500 };
    }
};

module.exports = get;
