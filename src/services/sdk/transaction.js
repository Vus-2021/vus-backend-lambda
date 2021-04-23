/* eslint-disable no-case-declarations */
const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();
const _ = require('lodash');

const makeUpdateExpression = (key, method) => {
    const expressionMap = new Map()
        .set('SET', `#${key} = :${key}, `)
        .set('ADD', `#${key} :${key}, `);

    return expressionMap.get(method);
};

const transaction = async ({ tableName, ...args }) => {
    const transactionItem = [];
    let updateParam;
    const TableName = tableName;
    const existedParameters = Object.entries(args).filter((value) => value[1] != undefined);
    for (let [method, transaction] of existedParameters) {
        for (let item of transaction) {
            switch (method) {
                case 'Put':
                    transactionItem.push({
                        Put: {
                            TableName,
                            Item: item,
                        },
                    });
                    break;

                case 'Delete':
                    if (_.isNil(item.primaryKey.partitionKey)) break;
                    transactionItem.push({
                        Delete: {
                            TableName,
                            Key: item.primaryKey,
                        },
                    });
                    break;

                case 'Update':
                    if (_.isNil(item.primaryKey.partitionKey)) break;
                    let updateParameters = Object.entries(item.updateItem).filter(
                        (value) => value[1] != undefined
                    );
                    updateParam = {
                        TableName,
                        Key: item.primaryKey,
                        UpdateExpression: `${item.method} `,
                        ExpressionAttributeNames: {},
                        ExpressionAttributeValues: {},
                    };

                    for (let [key, value] of updateParameters) {
                        Object.assign(updateParam, {
                            UpdateExpression: updateParam.UpdateExpression.concat(
                                makeUpdateExpression(key, item.method)
                            ),
                            ExpressionAttributeNames: Object.assign(
                                updateParam.ExpressionAttributeNames,
                                {
                                    ['#' + key]: key,
                                }
                            ),
                            ExpressionAttributeValues: Object.assign(
                                updateParam.ExpressionAttributeValues,
                                {
                                    [':' + key]: value,
                                }
                            ),
                        });
                    }
                    updateParam.UpdateExpression = updateParam.UpdateExpression.slice(0, -2);
                    transactionItem.push({ Update: updateParam });
                    break;
            }
        }
    }

    try {
        await documentClient
            .transactWrite({
                TransactItems: transactionItem,
            })
            .promise();
        return { success: true, message: '성공', code: 204 };
    } catch (error) {
        console.log(error);
        return { success: false, message: error.message, code: 500 };
    }
};

module.exports = transaction;
