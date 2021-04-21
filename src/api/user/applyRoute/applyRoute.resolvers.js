const dayjs = require('dayjs');
const dateNow = require('../../../modules/dateNow');
const _ = require('lodash');

const { get, query, transaction } = require('../../../services');

/**
 * TODO Token
 */
const resolvers = {
    Mutation: {
        applyRoute: async (
            parent,
            { route, month, partitionKey, userId, detailPartitionKey },
            { user }
        ) => {
            if (!user) {
                return { success: false, message: 'access denied', code: 403 };
            }
            if (userId) {
                user.userId = userId;
            }

            let params = {
                sortKey: ['#info', 'eq'],
                gsiSortKey: [route, 'eq'],
                index: ['sk-index', 'using'],
            };

            try {
                const { data: alreadyApply } = await get({
                    partitionKey: user.userId,
                    sortKey: `#applyRoute#${month}`,
                });

                if (alreadyApply) {
                    return { success: false, message: 'already Apply', code: 400 };
                }

                const { data: result } = await query({
                    params,
                });

                if (result.count === 0) {
                    return { success: false, message: 'invalid route info', code: 400 };
                }
                const { data: previousMonth } = await get({
                    partitionKey: user.userId,
                    sortKey: `#applyRoute#${dayjs(month).subtract(1, 'month').format('YYYY-MM')}`,
                });
                const previousMonthState = _.isNil(previousMonth)
                    ? 'notApply'
                    : previousMonth.state;

                const { data: userInfo } = await get({
                    partitionKey: user.userId,
                    sortKey: '#user',
                });

                const userApplyData = {
                    partitionKey: user.userId,
                    sortKey: `#applyRoute#${month}`,
                    gsiSortKey: route,
                    state: 'pending',
                    isCancellation: false,
                    busId: partitionKey,
                    previousMonthState,
                    registerDate: userInfo.gsiSortKey.split('#')[2],
                    createdAt: dateNow(),
                    detailPartitionKey,
                    userName: userInfo.name,
                    phoneNumber: userInfo.phoneNumber,
                };

                const busInfo = {
                    primaryKey: {
                        partitionKey: result[0].partitionKey,
                        sortKey: `#${month}`,
                    },
                    method: 'ADD',
                    updateItem: { registerCount: 1 },
                };
                const { success, message, code } = await transaction({
                    Put: [userApplyData],
                    Update: [busInfo],
                });

                return { success, message, code };
            } catch (error) {
                return { success: false, message: error.message, code: 500 };
            }
        },
    },
};

module.exports = resolvers;
