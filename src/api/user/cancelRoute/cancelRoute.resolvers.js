/* eslint-disable no-dupe-keys */
const dayjs = require('dayjs');
const { get, transaction } = require('../../../services');

/**
 * TODO 신청 취소할때. 취소한 월이 탑승 월보다 전일때는 컬럼을 삭제, 그게 아니면 cancelled toggle,
 */

const resolvers = {
    Mutation: {
        cancelRoute: async (parent, { busId, month }, { user }) => {
            const nowMonth = dayjs(new Date()).format('YYYY-MM');
            if (!user) {
                return { success: false, message: 'access denied', code: 403 };
            }
            try {
                let { success, message, code, data } = {};

                ({ success, message, code, data } = await get({
                    partitionKey: user.userId,
                    sortKey: `#applyRoute#${month}`,
                }));

                const userInfoByDetailLocation = Object.assign({
                    primaryKey: {
                        partitionKey: data.detailPartitionKey,
                        sortKey: `#${month}#${data.partitionKey}`,
                    },
                });
                if (!data) {
                    return { success: false, message: '이미 취소 되었음', code: 400 };
                }

                if (data.isCancellation) {
                    return { success: false, message: '이미 취소되었음', code: 400 };
                }

                ({ success, message, code, data } = await get({
                    partitionKey: busId,
                    sortKey: `#${month}`,
                }));

                if (!data) {
                    return { success: false, message: '버스 정보가 일치하지 않음.', code: 400 };
                }

                const bus = {
                    partitionKey: busId,
                    sortKey: `#${month}`,
                };

                if (nowMonth === month) {
                    ({ success, message, code } = await transaction({
                        Update: [
                            {
                                primaryKey: {
                                    partitionKey: user.userId,
                                    sortKey: `#applyRoute#${month}`,
                                },
                                method: 'SET',
                                updateItem: { isCancellation: true },
                            },
                            {
                                primaryKey: bus,
                                method: 'ADD',
                                updateItem: { registerCount: -1 },
                            },
                        ],
                        Delete: [userInfoByDetailLocation],
                    }));
                } else {
                    ({ success, message, code } = await transaction({
                        Delete: [
                            {
                                primaryKey: {
                                    partitionKey: user.userId,
                                    sortKey: `#applyRoute#${month}`,
                                },
                            },
                            userInfoByDetailLocation,
                        ],
                        Update: [
                            {
                                primaryKey: bus,
                                method: 'ADD',
                                updateItem: { registerCount: -1 },
                            },
                        ],
                    }));
                }
                return { success, message, code };
            } catch (error) {
                return { success: false, message: error.message, code: 500 };
            }
        },
    },
};

module.exports = resolvers;
