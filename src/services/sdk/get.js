const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();

const get = async (args) => {
    const params = {
        TableName: process.env.TABLE_NAME,
        Key: args,
    };
    try {
        const data = (await documentClient.get(params).promise()).Item;
        return { success: true, message: 'get success', code: 200, data };
    } catch (error) {
        console.log(error);
        return { success: false, message: error.message, code: 500 };
    }
};

module.exports = get;
