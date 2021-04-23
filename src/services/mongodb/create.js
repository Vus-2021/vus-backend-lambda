const vus = require('../../model/mongodb');

const create = async ({ tableName, ...args }) => {
    try {
        await new vus({
            ...args,
        }).save();

        return { success: true, message: 'success crete ', code: 201 };
    } catch (error) {
        console.log(error);
        return { success: false, message: error.message, code: 500 };
    }
};

module.exports = create;
