const { query, transaction } = require('../../../../services');
/**
 * get All PartritionKey
 */
const resolvers = {
    Mutation: {
        addAllMonthlyRoute: async (_, args, { user }) => {
            if (!user || user.type !== 'ADMIN') {
                return { success: false, message: 'access denied', code: 403 };
            }
            let success, message, code;
            const tableName = process.env.TABLE_NAME;
            try {
                let { data: alredayMonthlyBusRoute } = await query({
                    params: {
                        sortKey: [`#${args.month}`, 'eq'],
                        index: ['sk-index', 'using'],
                    },
                    tableName,
                });
                if (alredayMonthlyBusRoute.length > 0) {
                    return { success: false, message: '이미 생성되었습니다.', code: 400 };
                }

                let { data: bus } = await query({
                    params: {
                        sortKey: ['#info', 'eq'],
                        index: ['sk-index', 'using'],
                    },
                    tableName,
                });
                bus = bus.map((item) => {
                    return {
                        partitionKey: item.partitionKey,
                        sortKey: `#${args.month}`,
                        gsiSortKey: item.gsiSortKey,
                        registerCount: 0,
                    };
                });
                ({ success, message, code } = await transaction({
                    Put: bus,
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
