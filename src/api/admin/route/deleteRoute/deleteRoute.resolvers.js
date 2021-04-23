const { get, transaction, query } = require('../../../../services');
/**
 * TODO onDelete
 */

const resolvers = {
    Mutation: {
        deleteRoute: async (_, { partitionKey }, { user }) => {
            if (!user || user.type !== 'ADMIN') {
                return { success: false, message: 'access denied', code: 403 };
            }
            const sortKey = '#info';
            let Delete = [];
            try {
                let { success, message, code, data } = await get({
                    partitionKey,
                    sortKey,
                    tableName: process.env.TABLE_NAME,
                });
                if (!data) {
                    return { success: false, message: 'invalide Route Id', code: 400 };
                }
                const driver = data.driver;
                const route = data.gsiSortKey;
                ({ success, message, code, data } = await query({
                    params: {
                        sortKey: ['#detail', 'eq'],
                        index: ['sk-index', 'using'],
                    },
                    filterExpression: {
                        route: [route, 'eq'],
                    },
                    tableName: process.env.TABLE_NAME,
                }));
                if (data) {
                    Delete = data.map((item) => {
                        return {
                            primaryKey: {
                                partitionKey: item.partitionKey,
                                sortKey: '#detail',
                            },
                        };
                    });
                }
                Delete.push({
                    primaryKey: {
                        partitionKey: driver.userId,
                        sortKey: '#driver',
                    },
                });
                Delete.push({ primaryKey: { partitionKey, sortKey } });

                ({ success, message, code } = await transaction({
                    Delete,
                    tableName: process.env.TABLE_NAME,
                }));
                return { success, message, code };
            } catch (error) {
                return { success: false, message: error.message, code: 500 };
            }
        },
    },
};

module.exports = resolvers;
