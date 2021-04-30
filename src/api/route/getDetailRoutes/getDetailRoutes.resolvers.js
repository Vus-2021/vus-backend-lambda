const { query } = require('../../../services');

const resolvers = {
    Query: {
        getDetailRoutes: async (_, { route, currentLocation, month }) => {
            let passengerMap = new Map();
            try {
                const params = {
                    sortKey: ['#detail', 'eq'],
                    index: ['sk-index', 'using'],
                    sort: ['ascending', 'sort'],
                };

                const filterExpression = {
                    route: [route, 'eq'],
                    currentLocation: [currentLocation, 'eq'],
                };

                const { success, message, code, data: details } = await query({
                    params,
                    filterExpression,
                    tableName: process.env.TABLE_NAME,
                });

                details.forEach((item) => {
                    item.boardingTime = item.gsiSortKey.split('#')[2];
                    let detailPartitionKey = item.partitionKey;
                    passengerMap.set(
                        detailPartitionKey,
                        query({
                            params: {
                                partitionKey: [item.partitionKey, 'eq'],
                                sortKey: [`#${month}`, 'beginsWith'],
                            },
                            tableName: process.env.TABLE_NAME,
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
                    details.forEach((item) => {
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

                return { success, message, code, data: details };
            } catch (error) {
                return { success: false, message: error.message, code: 500 };
            }
        },
    },
};

module.exports = resolvers;
