const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();

const create = async ({ tableName, ...args }) => {
    const params = {
        TableName: tableName,
        Item: args,
    };
    try {
        await documentClient.put(params).promise();
        return { success: true, message: 'success crete ', code: 201 };
    } catch (error) {
        console.log(error);
        return { success: false, message: error.message, code: 500 };
    }
};

module.exports = create;
