const vus = require('../../model/mongodb');
const _ = require('lodash');
const updateMap = new Map().set('SET', '$set').set('ADD', `$inc`);
const transaction = async (args) => {
    try {
        const existedParameters = Object.entries(args).filter((value) => value[1] != undefined);
        const session = await vus.startSession();
        session.startTransaction();
        for (let [method, transaction] of existedParameters) {
            for (let item of transaction) {
                switch (method) {
                    case 'Put':
                        await vus.create([item], { session: session });
                        break;
                    case 'Delete':
                        if (_.isNil(item.primaryKey.partitionKey)) break;
                        await vus.deleteOne(item.primaryKey, { session: session });
                        break;
                    case 'Update':
                        if (_.isNil(item.primaryKey.partitionKey)) break;
                        await vus.updateOne(item.primaryKey, {
                            [updateMap.get(item.method)]: item.updateItem,
                        });
                        break;
                }
            }
        }
        await session.commitTransaction();
        session.endSession();

        return { success: true, message: '성공', code: 204 };
    } catch (error) {
        return { success: false, message: error.message, code: 500 };
    }
};

module.exports = transaction;
