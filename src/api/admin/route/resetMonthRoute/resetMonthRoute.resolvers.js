const { get, transaction } = require('../../../../services');
/**
 * Transaction
 */

const resolvers = {
    Mutation: {
        resetMonthRoute: async (parent, { busId, month, route, userId }, { user }) => {
            if (!user || user.type !== 'ADMIN') {
                return { success: false, message: 'access denied', code: 403 };
            }

            try {
                let { success, message, code, data } = {};

                ({ success, message, code, data } = await get({
                    partitionKey: busId,
                    sortKey: `#${month}`,
                    tableName: process.env.TABLE_NAME,
                }));

                if (!data) {
                    return { success: false, message: '없는 노선 정보 ', code };
                }

                ({ success, message, code, data } = await get({
                    partitionKey: busId,
                    sortKey: `#info`,
                    tableName: process.env.TABLE_NAME,
                }));

                if (data.gsiSortKey !== route) {
                    return { success: false, message: 'invalid route', code: 400 };
                }

                const userList = userId.map((item) => {
                    return {
                        primaryKey: {
                            partitionKey: item,
                            sortKey: `#applyRoute#${month}`,
                        },
                    };
                });
                const bus = {
                    partitionKey: busId,
                    sortKey: `#${month}`,
                };

                ({ success, message, code } = await transaction({
                    Delete: userList,
                    Update: [
                        {
                            primaryKey: bus,
                            updateItem: { registerCount: -1 * userId.length },
                            method: 'ADD',
                        },
                    ],
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
