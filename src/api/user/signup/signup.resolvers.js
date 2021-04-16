const { getSalt, getHashedPassword } = require('../../../modules/hash');
const { create, get } = require('../../../services');
const _ = require('lodash');

const resolvers = {
    Query: {
        dummy: () => {
            return { token: 'hello' };
        },
    },
    Mutation: {
        signupUser: async (parent, args) => {
            const { userId, password, name, phoneNumber, type, registerDate } = args.input;
            const { data: user } = await get({
                partitionKey: userId,
                sortKey: '#user',
            });
            if (!_.isNil(user)) {
                return { success: false, message: 'alreadyUserId', code: 400 };
            }
            const salt = getSalt();
            const HashedPassword = await getHashedPassword(password, salt);
            const { success, message, code } = await create({
                partitionKey: userId,
                sortKey: '#user',
                gsiSortKey: `#registerDate#${registerDate}`,
                password: HashedPassword,
                salt,
                name,
                phoneNumber,
                type,
            });

            if (!success) {
                return { success, message, code };
            }

            return { success, message, code };
        },
    },
};

module.exports = resolvers;
