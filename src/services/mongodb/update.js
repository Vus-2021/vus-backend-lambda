const vus = require('../../model/mongodb');
const updateMap = new Map().set('SET', '$set').set('ADD', `$inc`);

const update = async (args) => {
    try {
        await vus.updateOne(args.primaryKey, {
            [updateMap.get(args.method)]: args.updateItem,
        });

        return { success: true, message: 'success update', code: 204 };
    } catch (error) {
        return { success: false, message: error.message, code: 500 };
    }
};

module.exports = update;
