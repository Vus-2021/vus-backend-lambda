const { getHashedPassword } = require('../../../modules/hash');
const { get, update } = require('../../../services');
const _ = require('lodash');

const resolvers = {
    Mutation: {
        initPassword: async (parent, { userId, password }, { user }) => {
            const { data: userData } = await get({
                partitionKey: userId || user.userId,
                sortKey: '#user',
                tableName: process.env.TABLE_NAME,
            });
            if (_.isNil(user)) {
                return { success: false, message: 'invalid user', code: 400 };
            }

            const salt = userData.salt;
            const HashedPassword = await getHashedPassword(password, salt);
            const { success, message, code } = await update({
                primaryKey: { partitionKey: userData.partitionKey, sortKey: '#user' },
                updateItem: { password: HashedPassword },
                method: 'SET',
                tableName: process.env.TABLE_NAME,
            });

            if (!success) {
                return { success, message, code };
            }

            return { success, message, code };
        },
    },
};

module.exports = resolvers;
