const vus = require('../../model/dynamoose');

const update = async (args) => {
    try {
        await vus.update(args.primaryKey, { ['$' + args.method]: args.updateItem });

        return { success: true, message: 'success update', code: 204 };
    } catch (error) {
        return { success: false, message: error.message, code: 500 };
    }
};

module.exports = update;
