const { get } = require('../../../services');

const resolvers = {
    Query: {
        checkUserId: async (_, args) => {
            try {
                const { userId } = args;
                const { success, message, data: alreadyUserId, code } = await get({
                    partitionKey: userId,
                    sortKey: '#user',
                    tableName: process.env.TABLE_NAME,
                });

                if (alreadyUserId) {
                    return { success: false, message: 'alreadyUserId', code };
                }

                return { success, message, code };
            } catch (error) {
                return { success: true, message: error.message, code: 500 };
            }
        },
    },
};

module.exports = resolvers;
