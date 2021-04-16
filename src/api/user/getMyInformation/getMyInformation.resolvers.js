const { query } = require('../../../services');
/**
 * TOdo  driver는 sk 가 #driver, 그리고 노선 선택할때 #driver에 추가해줄것.
 */
const resolvers = {
    Query: {
        getMyInformation: async (parent, args, context) => {
            if (!context.user) return { success: false, message: context.message, code: 400 };
            const params = {
                partitionKey: [context.user.userId, 'eq'],
            };
            try {
                let { data } = await query({ params });
                if (context.user.type === 'DRIVER') {
                    data = data
                        .filter((item) => {
                            return item.sortKey === '#driver';
                        })
                        .map((item) => {
                            return Object.assign(item, {
                                route: item.gsiSortKey,
                            });
                        });
                } else {
                    data = data
                        .filter((item) => {
                            return (
                                (item.state === 'pending' || item.state === 'fulfilled') &&
                                !item.isCancellation &&
                                item.sortKey !== '#user'
                            );
                        })
                        .map((dataItem) => {
                            return {
                                partitionKey: dataItem.partitionKey,
                                sortKey: dataItem.sortKey,
                                route: dataItem.gsiSortKey,
                                busId: dataItem.busId,
                                month: dataItem.sortKey.split('#')[2],
                            };
                        });
                }
                const obj = context.user;
                obj.routeInfo = data;

                return {
                    success: true,
                    message: 'success get my information',
                    code: 200,
                    data: obj,
                };
            } catch (error) {
                return { success: false, message: error.message, code: 500 };
            }
        },
    },
};

module.exports = resolvers;
