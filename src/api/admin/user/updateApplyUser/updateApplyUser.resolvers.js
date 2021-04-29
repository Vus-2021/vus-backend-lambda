const { get, transaction } = require('../../../../services');

const resolvers = {
    Mutation: {
        updateApplyUser: async (parent, { userId, month, state, isCancellation }, { user }) => {
            if (!user || user.type !== 'ADMIN') {
                return { success: false, message: 'access denied', code: 403 };
            }
            let { success, message, code, data } = {};
            const FULFILLED = 'fulfilled';
            const Delete = [];
            const Put = [];
            try {
                ({ success, message, code, data } = await get({
                    partitionKey: userId,
                    sortKey: `#applyRoute#${month}`,
                    tableName: process.env.TABLE_NAME,
                }));
            } catch (error) {
                return { success: false, message: error.message, code: 500 };
            }
            const Update = [
                {
                    primaryKey: {
                        partitionKey: userId,
                        sortKey: `#applyRoute#${month}`,
                    },
                    updateItem: {
                        state: state,
                        isCancellation: isCancellation,
                    },
                    method: 'SET',
                },
            ];
            const preApplyInfo = data;

            if (preApplyInfo.state === FULFILLED && state !== FULFILLED) {
                Delete.push({
                    primaryKey: {
                        partitionKey: preApplyInfo.detailPartitionKey,
                        sortKey: `#${month}#${userId}`,
                    },
                });
            } else if (preApplyInfo.state !== FULFILLED && state === FULFILLED) {
                Put.push({
                    partitionKey: preApplyInfo.detailPartitionKey,
                    sortKey: `#${month}#${userId}`,
                    gsiSortKey: preApplyInfo.gsiSortKey,
                    phoneNumber: preApplyInfo.phoneNumber,
                    name: preApplyInfo.userName,
                    userId: userId,
                });
            }
            try {
                ({ success, message, code } = await transaction({
                    Update,
                    Delete,
                    Put,
                    tableName: process.env.TABLE_NAME,
                }));
            } catch (error) {
                return { success: false, message: error.message, code: 500 };
            }

            return { success, message, code };
        },
    },
};

module.exports = resolvers;
