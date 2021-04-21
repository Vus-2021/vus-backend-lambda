const { query } = require('../../../services');

const resolvers = {
    Query: {
        getDetailRoutes: async (_, { route, currentLocation, month }) => {
            let passengerMap = new Map();
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
                    passengerMap.set(
                        item.partitionKey,
                        query({
                            params: {
                                partitionKey: [item.partitionKey, 'eq'],
                                sortKey: [`#${month}`, 'beginsWith'],
                            },
                        })
                    );
                });
                if (month) {
                    const passengerValues = await Promise.all(passengerMap.values());
                    const passengerKeys = [...passengerMap.keys()];
                    passengerMap = new Map(
                        passengerKeys.map((key, index) => {
                            return [key, passengerValues[index].data];
                        })
                    );
                    data.forEach((item) => {
                        item.passengers = passengerMap.get(item.partitionKey).map((item) => {
                            return {
                                phoneNumber: item.phoneNumber,
                                route: item.gsiSortKey,
                                partitionKey: item.partitionKey,
                                month: item.sortKey.split('#')[1],
                                name: item.name,
                                userId: item.userId,
                            };
                        });
                    });
                }

                return { success, message, code, data };
            } catch (error) {
                return { success: false, message: error.message, code: 500 };
            }
        },
    },
};

module.exports = resolvers;
