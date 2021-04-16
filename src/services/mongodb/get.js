const vus = require('../../model/mongodb');

const get = async (args) => {
    try {
        const data = await vus.findOne(args);
        return { success: true, message: 'get success', code: 200, data };
    } catch (error) {
        console.log(error);
        return { success: false, message: error.message, code: 500 };
    }
};

module.exports = get;
