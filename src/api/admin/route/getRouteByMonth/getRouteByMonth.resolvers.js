const { query } = require('../../../../services');

const resolvers = {
    Query: {
        getRouteByMonth: async (parent, { partitionKey }, { user }) => {
            if (!user || user.type !== 'ADMIN') {
                return { success: false, message: 'access denied', code: 403 };
            }

            const params = {
                partitionKey: [partitionKey, 'eq'],
                sortKey: ['#2', 'beginsWith'],
            };

            try {
                const { success, message, code, data } = await query({
                    params,
                });
                data.forEach((item) => {
                    item.month = item.sortKey.split('#')[1];
                });
                return { success, message, code, data };
            } catch (error) {
                return { success: false, message: error.message, code: 500 };
            }
        },
    },
};

module.exports = resolvers;
