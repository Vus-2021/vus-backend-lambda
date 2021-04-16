/* eslint-disable no-unused-vars */
const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();

const makeExpression = (key, method) => {
    const expressionMap = new Map()
        .set('eq', `#${key} = :${key} and `)
        .set('beginsWith', `begins_with (#${key}, :${key}) and `)
        .set('contains', `contains(#${key}, :${key}) and `);

    return expressionMap.get(method);
};

const query = async function ({ params, filterExpression }) {
    let param = {
        TableName: process.env.TABLE_NAME,
        KeyConditionExpression: '',
        FilterExpression: '',
        ExpressionAttributeNames: {},
        ExpressionAttributeValues: {},
    };

    const existedParameters = Object.entries(params).filter((value) => value[1][0] != undefined);
    for (let [key, [value, method]] of existedParameters) {
        switch (key) {
            case 'sort':
                Object.assign(param, { ScanIndexForward: value === 'ascending' });
                break;
            case 'index':
                Object.assign(param, { IndexName: value });
                break;
            default:
                Object.assign(param, {
                    KeyConditionExpression: param.KeyConditionExpression.concat(
                        makeExpression(key, method)
                    ),
                    ExpressionAttributeNames: Object.assign(param.ExpressionAttributeNames, {
                        ['#' + key]: key,
                    }),
                    ExpressionAttributeValues: Object.assign(param.ExpressionAttributeValues, {
                        [':' + key]: value,
                    }),
                });
                break;
        }
    }

    let existedFilterExpression = [];
    if (filterExpression) {
        existedFilterExpression = Object.entries(filterExpression).filter(
            (value) => value[1][0] != undefined
        );
    }
    for (let [key, [value, method]] of existedFilterExpression) {
        Object.assign(param, {
            FilterExpression: param.FilterExpression.concat(makeExpression(key, method)),
            ExpressionAttributeNames: Object.assign(param.ExpressionAttributeNames, {
                ['#' + key]: key,
            }),
            ExpressionAttributeValues: Object.assign(param.ExpressionAttributeValues, {
                [':' + key]: value,
            }),
        });
    }
    try {
        param.KeyConditionExpression = param.KeyConditionExpression.slice(0, -5);
        param.FilterExpression === ''
            ? delete param.FilterExpression
            : (param.FilterExpression = param.FilterExpression.slice(0, -5));

        const data = (await documentClient.query(param).promise()).Items;
        return {
            success: true,
            message: 'Success query',
            code: 200,
            data: data,
        };
    } catch (error) {
        console.log(error);
        return {
            success: false,
            message: error.message,
            code: 500,
        };
    }
};
module.exports = query;
