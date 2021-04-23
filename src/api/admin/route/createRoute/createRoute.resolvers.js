const { transaction, get } = require('../../../../services');

const uuid = require('uuid');

const resolvers = {
    Mutation: {
        createRoute: async (_, args, { user }) => {
            if (!user || user.type !== 'ADMIN') {
                return { success: false, message: 'access denied', code: 403 };
            }
            const { busNumber, limitCount, driver, route, imageUrl } = args;
            const [partitionKey, sortKey, gsiSortKey] = [uuid.v4(), '#info', route];
            try {
                const { data: alreadyDriver } = await get({
                    partitionKey: driver.userId,
                    sortKey: '#driver',
                    tableName: process.env.TABLE_NAME,
                });
                if (alreadyDriver) {
                    return {
                        success: false,
                        message: '다른 노선에 등록된 기사님 입니다.',
                        code: 400,
                    };
                }

                let routeInfo = { busNumber, limitCount, driver, imageUrl };

                const driverPk = { partitionKey: driver.userId, sortKey: '#driver' };

                const { success, message, code } = await transaction({
                    Put: [
                        {
                            partitionKey,
                            sortKey,
                            gsiSortKey,
                            ...routeInfo,
                        },
                    ],
                    Update: [
                        {
                            primaryKey: driverPk,
                            method: 'SET',
                            updateItem: {
                                busId: partitionKey,
                                gsiSortKey: gsiSortKey,
                            },
                        },
                    ],
                    tableName: process.env.TABLE_NAME,
                });

                return { success, message, code };
            } catch (error) {
                return { success: false, message: error.message, code: 500 };
            }
        },
    },
};

module.exports = resolvers;
