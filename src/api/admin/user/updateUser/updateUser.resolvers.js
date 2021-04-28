const { update } = require('../../../../services');

const resolvers = {
    Mutation: {
        updateUser: async (parent, { userId, name, phoneNumber, type, registerDate }, { user }) => {
            if (user.type !== 'ADMIN') {
                return { success: false, message: 'access denied', code: 403 };
            }
            try {
                const { success, message, code } = await update({
                    primaryKey: {
                        partitionKey: userId,
                        sortKey: '#user',
                    },
                    updateItem: {
                        name,
                        phoneNumber,
                        type,
                        registerDate,
                    },
                    method: 'SET',
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
