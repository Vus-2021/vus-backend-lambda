const vus = require('../../model/dynamoose');
const dynamoose = require('dynamoose');
const _ = require('lodash');

const transaction = async (args) => {
    const transactionList = [];
    const existedParameters = Object.entries(args).filter((value) => value[1] != undefined);
    for (let [method, transaction] of existedParameters) {
        for (let item of transaction) {
            switch (method) {
                case 'Put':
                    transactionList.push(vus.transaction.create(item));
                    break;
                case 'Delete':
                    if (_.isNil(item.primaryKey.partitionKey)) break;
                    transactionList.push(vus.transaction.delete(item.primaryKey));
                    break;
                case 'Update':
                    if (_.isNil(item.primaryKey.partitionKey)) break;
                    transactionList.push(
                        vus.transaction.update(item.primaryKey, {
                            [`$${item.method}`]: item.updateItem,
                        })
                    );
                    break;
            }
        }
    }

    try {
        await dynamoose.transaction(transactionList);
        return { success: true, message: '성공', code: 204 };
    } catch (error) {
        return { success: false, message: error.message, code: 500 };
    }
};

module.exports = transaction;
