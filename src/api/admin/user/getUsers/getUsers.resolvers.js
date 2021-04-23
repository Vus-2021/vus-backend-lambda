const { query } = require('../../../../services');

const resolvers = {
    Query: {
        getUsers: async (parent, args, { user }) => {
            if (!user || user.type !== 'ADMIN') {
                return { success: false, message: 'access denied', code: 403 };
            }
            let { userId, name, type, isMatched } = {
                userId: args.userId,
                name: args.name,
                type: args.type,
                isMatched: args.isMatched || false,
            };

            isMatched = isMatched ? 'eq' : 'contains';

            const params = {
                sortKey: ['#user', 'eq'],
                index: ['sk-index', 'using'],
            };

            const filterExpression = {
                name: [name, isMatched],
                type: [type, isMatched],
                partitionKey: [userId, isMatched],
            };

            try {
                const { success, message, code, data } = await query({
                    params,
                    filterExpression,
                    tableName: process.env.TABLE_NAME,
                });
                data.forEach((user) => {
                    user.registerDate = user.gsiSortKey.split('#')[2];
                    user.userId = user.partitionKey;
                });

                return { success, message, code, data };
            } catch (error) {
                return { success: false, message: error.message, code: 500 };
            }
        },
    },
};

module.exports = resolvers;
