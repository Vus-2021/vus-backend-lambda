/* eslint-disable no-unused-vars */
const { query, transaction } = require('../../../../services');
const resolvers = {
    Mutation: {
        initPassengers: async (parent, { month, route, busId }, { user }) => {
            if (!user || user.type !== 'ADMIN') {
                return { success: false, message: 'access denied', code: 403 };
            }
            let Update = [];
            try {
                let { data: users } = await query({
                    params: {
                        sortKey: [`#applyRoute#${month}`, 'eq'],
                        gsiSortKey: [route, 'eq'],
                        index: ['sk-index', 'using'],
                    },
                });

                Update = users.map((item) => {
                    return {
                        primaryKey: {
                            partitionKey: item.partitionKey,
                            sortKey: item.sortKey,
                        },
                        updateItem: { state: 'pending' },
                        method: 'SET',
                    };
                });

                const { success, message, code } = await transaction({ Update });
                return { success, message, code };
            } catch (error) {
                return { success: false, message: error.message, code: 500 };
            }
        },
    },
};

module.exports = resolvers;
