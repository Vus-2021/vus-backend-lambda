const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();

const deleteItem = async (args) => {
    const params = {
        TableName: process.env.TABLE_NAME,
        Key: args,
    };
    try {
        await documentClient.delete(params).promise();
        return { success: true, message: '삭제 성공', code: 204 };
    } catch (error) {
        return { success: false, message: '서버 에러', code: 500 };
    }
};

module.exports = deleteItem;
