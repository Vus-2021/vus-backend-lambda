const { update } = require('../../../../services');

const resolvers = {
    Mutation: {
        updateApplyUser: async (parent, { userId, month, state }, { user }) => {
            if (!user || user.type !== 'ADMIN') {
                return { success: false, message: 'access denied', code: 403 };
            }
            try {
                const { success, message, code } = await update({
                    primaryKey: {
                        partitionKey: userId,
                        sortKey: `#applyRoute#${month}`,
                    },
                    updateItem: {
                        state: state,
                    },
                    method: 'SET',
                });
                return { success, message, code };
            } catch (error) {
                return { success: false, message: error.message, code: 500 };
            }
        },
    },
};

module.exports = resolvers;
