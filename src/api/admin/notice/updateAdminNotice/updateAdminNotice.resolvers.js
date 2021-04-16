const dateNow = require('../../../../modules/dateNow');
const { update } = require('../../../../services');

const resolvers = {
    Mutation: {
        updateAdminNotice: async (_, { partitionKey, notice, content }, { user }) => {
            if (!user || user.type !== 'ADMIN') {
                return { success: false, message: 'access denied', code: 403 };
            }
            const updateItem = { notice, content, updatedAt: dateNow() };
            try {
                const { success, message, code } = await update({
                    primaryKey: { partitionKey, sortKey: '#notice' },
                    updateItem,
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
