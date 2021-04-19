const { get, query, transaction } = require('../../../../services');

const resolvers = {
    Mutation: {
        updateRoute: async (
            _,
            { partitionKey, route, busNumber, limitCount, driver, imageUrl },
            { user }
        ) => {
            if (!user || user.type !== 'ADMIN') {
                return { success: false, message: 'access denied', code: 403 };
            }
            const driverPk = { partitionKey: driver.userId, sortKey: '#driver' };
            let updateItem = { gsiSortKey: route, busNumber, limitCount, driver, imageUrl };
            const Update = [];
            const Delete = [];
            try {
                const thisRoute = (await get({ partitionKey, sortKey: '#info' })).data;

                const { data: alreadyDriver } = await get(driverPk);
                if (alreadyDriver && !(driver.userId === thisRoute.driver.userId)) {
                    return {
                        success: false,
                        message: '다른 노선에 등록된 기사님 입니다.',
                        code: 400,
                    };
                }

                Delete.push({ partitionKey: thisRoute.driver.userId, sortKey: '#driver' });

                let detailList;
                if (route !== thisRoute.gsiSortKey) {
                    const { data: details } = await query({
                        params: {
                            sortKey: ['#detail', 'eq'],
                            index: ['sk-index', 'using'],
                        },
                        filterExpression: {
                            route: [thisRoute.gsiSortKey, 'eq'],
                        },
                    });

                    detailList = details.map((item) => {
                        return {
                            partitionKey: item.partitionKey,
                            sortKey: '#detail',
                            route: route,
                            gsiSortKey: item.gsiSortKey,
                            location: item.location,
                            lat: item.lat,
                            long: item.long,
                        };
                    });
                }

                if (detailList) {
                    for (let detail of detailList) {
                        let { partitionKey, sortKey, ...updateDetail } = detail;
                        Update.push({
                            primaryKey: { partitionKey, sortKey },
                            updateItem: updateDetail,
                            method: 'SET',
                        });
                    }
                }

                Update.push({
                    primaryKey: driverPk,
                    updateItem: {
                        busId: partitionKey,
                        gsiSortKey: updateItem.gsiSortKey,
                    },
                    method: 'SET',
                });

                Update.push({
                    primaryKey: {
                        partitionKey,
                        sortKey: '#info',
                    },
                    updateItem,
                    method: 'SET',
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
