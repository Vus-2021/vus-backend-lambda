const { deleteItem } = require('../../../../services');
const resolvers = {
    Mutation: {
        deleteDetailRoute: async (_, { partitionKey }, { user }) => {
            if (!user || user.type !== 'ADMIN') {
                return { success: false, message: 'access denied', code: 403 };
            }
            try {
                const { success, message, code } = await deleteItem({
                    partitionKey,
                    sortKey: '#detail',
                });
                return { success, message, code };
            } catch (error) {
                return { success: false, message: error.message, code: 500 };
            }
        },
    },
};

module.exports = resolvers;
