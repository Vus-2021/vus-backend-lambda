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
                let success, message, code, result, data;
                if (!route) {
                    ({ success, message, code, data: result } = await query({
                        params: {
                            sortKey: ['#info', 'eq'],
                            index: ['sk-index', 'using'],
                        },
                    }));
                } else {
                    ({ success, message, code, data: result } = await query({
                        params: {
                            sortKey: ['#info', 'eq'],
                            gsiSortKey: [route, 'eq'],
                            index: ['sk-index', 'using'],
                        },
                    }));
                }

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
                    });
                    busInfo.push(...bus);
                }

                busInfo.forEach((item) => {
                    busMap.get(item.partitionKey).month = {
                        registerCount: item.registerCount,
                        month: month,
                    };
                });

                data = [...busMap.values()];

                return { success, message, code, data };
            } catch (error) {
                return { success: false, message: error.message, code: 500 };
            }
        },
    },
};

module.exports = resolvers;
