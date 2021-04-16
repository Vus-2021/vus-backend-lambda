const { get, deleteItem, update, query } = require('../../../../services');
/**
 * Transaction
 */

const resolvers = {
    Mutation: {
        resetMonthRoute: async (parent, { busId, month, route }, { user }) => {
            if (!user || user.type !== 'ADMIN') {
                return { success: false, message: 'access denied', code: 403 };
            }
            const params = {
                sortKey: [`#applyRoute#${month}`, 'eq'],
                gsiSortKey: [route, 'eq'],
                index: ['sk-index', 'using'],
            };

            try {
                let { success, message, code, data } = {};

                ({ success, message, code, data } = await get({
                    partitionKey: busId,
                    sortKey: `#${month}`,
                }));

                if (!data) {
                    return { success: false, message: '없는 노선 정보 ', code };
                }

                ({ success, message, code, data } = await get({
                    partitionKey: busId,
                    sortKey: `#info`,
                }));

                if (data.gsiSortKey !== route) {
                    return { success: false, message: 'invalid route', code: 400 };
                }

                const userList = (
                    await query({
                        params,
                    })
                ).data.map((item) => {
                    return {
                        partitionKey: item.partitionKey,
                        sortKey: `#applyRoute#${month}`,
                    };
                });
                const bus = {
                    partitionKey: busId,
                    sortKey: `#${month}`,
                };

                for (let user of userList) {
                    ({ success, message, code } = await deleteItem(user));
                }

                ({ success, message, code } = await update({
                    primaryKey: bus,
                    updateItem: { registerCount: 0 },
                    method: 'SET',
                }));

                return { success, message, code };
            } catch (error) {
                return { success: false, message: error.message, code: 500 };
            }
        },
    },
};

module.exports = resolvers;
