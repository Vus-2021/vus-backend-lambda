const { query } = require('../../../services');

const resolvers = {
    Query: {
        getDetailRoutes: async (_, { route, currentLocation }) => {
            try {
                const params = {
                    sortKey: ['#detail', 'eq'],
                    currentLocation: [currentLocation, 'eq'],
                    index: ['sk-index', 'using'],
                    sort: ['ascending', 'sort'],
                };

                const filterExpression = {
                    route: [route, 'eq'],
                };

                const { success, message, code, data } = await query({
                    params,
                    filterExpression,
                });

                data.forEach((item) => {
                    item.boardingTime = item.gsiSortKey.split('#')[2];
                });
                return { success, message, code, data };
            } catch (error) {
                return { success: false, message: error.message, code: 500 };
            }
        },
    },
};

module.exports = resolvers;
