const dayjs = require('dayjs');
const { query } = require('../../../services');
/**
 * month랑, route를 필터링해서 받기....
 */
const resolvers = {
    Query: {
        getRoutesInfo: async (_, args) => {
            const { month, route } = {
                month: args.month || dayjs().format('YYYY-MM'),
                route: args.route,
            };

            try {
                let { success, message, code, data: result } = await query({
                    params: {
                        sortKey: ['#info', 'eq'],
                        gsiSortKey: [route, 'eq'],
                        index: ['sk-index', 'using'],
                    },
                    tableName: process.env.TABLE_NAME,
                });

                result.forEach((item) => {
                    item.route = item.gsiSortKey;
                });
                const busMap = new Map();
                result.forEach((bus) => {
                    busMap.set(bus.partitionKey, Object.assign(bus, { month: {} }));
                });

                const partitionKeys = result.map((item) => item.partitionKey);
                let busInfo = [];
                for (let partitionKey of partitionKeys) {
                    let { data: bus } = await query({
                        params: {
                            partitionKey: [partitionKey, 'eq'],
                            sortKey: [`#${month}`, 'beginsWith'],
                        },
                        tableName: process.env.TABLE_NAME,
                    });
                    busInfo.push(...bus);
                }

                busInfo.forEach((item) => {
                    busMap.get(item.partitionKey).month = {
                        registerCount: item.registerCount,
                        month: month,
                    };
                });

                const routeInfo = [...busMap.values()];

                await Promise.all(
                    routeInfo.map(async (item) => {
                        let boardingCount = await query({
                            params: {
                                sortKey: [`#applyRoute#${month}`, 'eq'],
                                gsiSortKey: [item.gsiSortKey, 'eq'],
                                index: ['sk-index', 'using'],
                            },
                            filterExpression: {
                                state: ['fulfilled', 'eq'],
                                isCancellation: [false, 'eq'],
                            },
                            tableName: process.env.TABLE_NAME,
                        });
                        Object.assign(item.month, { boardingCount: boardingCount.data.length });
                        return item;
                    })
                );

                return { success, message, code, data: routeInfo };
            } catch (error) {
                console.log(error);
                return { success: false, message: error.message, code: 500 };
            }
        },
    },
};

module.exports = resolvers;
