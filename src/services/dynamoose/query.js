/* eslint-disable no-unused-vars */
const vus = require('../../model/dynamoose');
const query = async function ({ params, filterExpression, tableName }) {
    try {
        let query = vus.query();

        const existedParameters = Object.entries({ ...params, ...filterExpression }).filter(
            (value) => value[1][0] != undefined
        );
        for (let [key, [value, method]] of existedParameters) {
            switch (method) {
                case 'using' || 'sort':
                    query = query[method](value);
                    break;
                default:
                    query = query.where(key)[method](value);
                    break;
            }
        }

        const data = await query.exec();

        return {
            success: true,
            message: 'Success query',
            code: 200,
            data: data,
        };
    } catch (error) {
        return {
            success: false,
            message: error.message,
            code: 500,
        };
    }
};
module.exports = query;
