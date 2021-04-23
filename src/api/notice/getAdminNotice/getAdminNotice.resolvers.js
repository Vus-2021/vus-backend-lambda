const { query } = require('../../../services');

const resolvers = {
    Query: {
        getAdminNotice: async (_, args) => {
            const { isMatched, notice, name, content, limit } = {
                notice: args.notice,
                name: args.name,
                content: args.content,
                isMatched: args.isMatched || false,
                limit: args.limit,
            };

            const method = isMatched ? 'eq' : 'contains';

            try {
                const params = {
                    sortKey: ['#notice', 'eq'],
                    sort: ['descending', 'sort'],
                    index: ['sk-index', 'using'],
                };

                const filterExpression = {
                    noticeType: ['ADMIN', 'eq'],
                    notice: [notice, method],
                    name: [name, method],
                    content: [content, method],
                };

                let { success, message, code, data } = await query({
                    params,
                    filterExpression,
                    tableName: process.env.TABLE_NAME,
                });

                data.forEach((item) => {
                    item.createdAt = item.gsiSortKey.split('#')[2];
                    item.author = item.name;
                });
                if (limit) {
                    data = data.slice(0, limit);
                }
                return { success, message, code, data };
            } catch (error) {
                return { success: false, message: error.message, code: 500 };
            }
        },
    },
};

module.exports = resolvers;
