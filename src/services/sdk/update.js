/* eslint-disable no-unused-vars */
const AWS = require('aws-sdk');

const documentClient = new AWS.DynamoDB.DocumentClient();

const update = async (args) => {
    const ExpressionAttributeNames = Object.entries({
        ...args.updateItem,
    }).reduce((acc, [key, _]) => {
        let obj = {};
        obj['#' + key] = key;
        return Object.assign(acc, obj);
    }, {});

    const ExpressionAttributeValues = Object.entries({
        ...args.updateItem,
    }).reduce((acc, [key, value]) => {
        let obj = {};
        obj[':' + key] = value;
        return Object.assign(acc, obj);
    }, {});

    const UpdateExpression = Object.entries({
        ...args.updateItem,
    })
        .reduce((acc, [key, _]) => {
            return acc.concat(` #${key} = :${key},`);
        }, args.method)
        .slice(0, -1);

    const params = {
        TableName: process.env.TABLE_NAME,
        Key: args.primaryKey,
        UpdateExpression,
        ExpressionAttributeNames,
        ExpressionAttributeValues,
    };
    try {
        await documentClient.update(params).promise();
        return { success: true, message: 'success update', code: 204 };
    } catch (error) {
        return { success: false, message: error.message, code: 500 };
    }
};

module.exports = update;
