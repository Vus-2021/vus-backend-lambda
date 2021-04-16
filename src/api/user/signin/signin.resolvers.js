const jwt = require('../../../modules/jwt');
const { getHashedPassword } = require('../../../modules/hash');
const { get } = require('../../../services');
const _ = require('lodash');

const resolvers = {
    Mutation: {
        signin: async (parent, args) => {
            const { userId, password } = args;
            let { data: getUser } = await get({
                partitionKey: userId,
                sortKey: '#user',
            });
            if (_.isNil(getUser)) {
                return { success: false, message: 'invalid user Id', code: 400 };
            }
            const salt = getUser.salt;
            const hashedPassword = await getHashedPassword(password, salt);
            const { success, data: user, message, code } = await get({
                partitionKey: userId,
                sortKey: '#user',
            });

            if (user.password !== hashedPassword) {
                return { success: false, message: 'not matched password', code: 400, user: null };
            }

            const payload = { userId: user.partitionKey, name: user.name, type: user.type };
            const token = await jwt.sign(payload);
            return { success, message, code, data: token };
        },
    },
};

module.exports = resolvers;
