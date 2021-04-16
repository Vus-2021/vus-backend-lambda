const dayjs = require('dayjs');
const duration = require('dayjs/plugin/duration');

const selectPassenger = require('../../../../modules/selectPassenger');
const { get, query, transaction } = require('../../../../services');
dayjs.extend(duration);
/**
 *
 * TODO 트랜잭션!
 */
const resolvers = {
    Mutation: {
        triggerPassengers: async (
            parent,
            { month, route, busId, methodList, sortType, monthArg },
            { user }
        ) => {
            if (!user || user.type !== 'ADMIN') {
                return { success: false, message: 'access denied', code: 403 };
            }
            let { success, message, code, data } = {};
            const Update = [];

            try {
                const bus = await get({ partitionKey: busId, sortKey: '#info' });

                ({ success, message, code, data } = await query({
                    params: {
                        sortKey: [`#applyRoute#${month}`, 'eq'],
                        gsiSortKey: [route, 'eq'],
                        index: ['sk-index', 'using'],
                    },
                }));

                let applicants = data;
                const limitCount = bus.data.limitCount;
                const { fulfilled, reject } = selectPassenger({
                    applicants,
                    limitCount,
                    methodList,
                    sortType,
                    monthArg,
                });
                const fulfilledKeys = fulfilled.map((item) => {
                    return {
                        partitionKey: item.partitionKey,
                        sortKey: item.sortKey,
                    };
                });

                const rejectKeys = reject.map((item) => {
                    return {
                        partitionKey: item.partitionKey,
                        sortKey: item.sortKey,
                    };
                });

                for (let primaryKey of fulfilledKeys) {
                    Update.push({
                        primaryKey,
                        updateItem: { state: 'fulfilled' },
                        method: 'SET',
                    });
                }
                for (let primaryKey of rejectKeys) {
                    Update.push({
                        primaryKey,
                        updateItem: { state: 'reject' },
                        method: 'SET',
                    });
                }
                ({ success, message, code, data } = await transaction({ Update }));

                return { success, message, code };
            } catch (error) {
                console.log(error);
                return { success: false, message: error.message, code: 500 };
            }
        },
    },
};

module.exports = resolvers;
