/* eslint-disable no-unused-vars */
const vus = require('../../model/mongodb');

const methodMap = (method) => {
    const expressionMap = new Map()
        .set('eq', 'equals')
        .set('beginsWith', `equals`)
        .set('contains', `equals`);

    return expressionMap.get(method);
};
const valueMap = (method, value) => {
    const valueMap = new Map()
        .set('eq', value)
        .set('beginsWith', new RegExp('^' + value))
        .set('contains', new RegExp(value));

    return valueMap.get(method);
};
const query = async function ({ params, filterExpression, tableName }) {
    try {
        let query = vus.find();

        const existedParameters = Object.entries({ ...params, ...filterExpression }).filter(
            (value) => value[1][0] != undefined
        );

        for (let [key, [value, method]] of existedParameters) {
            switch (method) {
                case 'using':
                    break;
                case 'sort':
                    query = query.sort({ ['gsiSortKey']: value });
                    break;
                default:
                    query = query.where(key)[methodMap(method)](valueMap(method, value));
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
