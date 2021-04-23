const { getSalt, getHashedPassword } = require('../../../../modules/hash');
const { transaction, get } = require('../../../../services');

const resolvers = {
    Mutation: {
        signupForExcel: async (parent, args, { user }) => {
            if (!user || user.type !== 'ADMIN') {
                return { success: false, message: 'access denied', code: 403 };
            }
            let users = JSON.parse(JSON.stringify(args.input));
            let alreadyUsers = [];
            for (let user of users) {
                let { data: alreadyUser } = await get({
                    partitionKey: user.userId,
                    sortKey: '#user',
                    tableName: process.env.TABLE_NAME,
                });
                if (alreadyUser) {
                    alreadyUsers.push(user);
                }
            }
            let alreadyUserSet = new Set(alreadyUsers);

            let newUsers = [...new Set(users.filter((user) => !alreadyUserSet.has(user)))];

            newUsers = await Promise.all(
                newUsers.map(async function (user) {
                    const salt = getSalt();
                    const HashedPassword = await getHashedPassword(user.password, salt);
                    return {
                        partitionKey: user.userId,
                        sortKey: '#user',
                        gsiSortKey: `#registerDate#${user.registerDate}`,
                        password: HashedPassword,
                        salt: salt,
                        name: user.name,
                        phoneNumber: user.phoneNumber,
                        type: user.type,
                    };
                })
            );
            if (newUsers.length === 0) {
                return { success: true, message: 'success', code: 204, data: alreadyUsers };
            }
            const { success, message, code } = await transaction({
                Put: newUsers,
                tableName: process.env.TABLE_NAME,
            });
            return { success, message, code, data: alreadyUsers };
        },
    },
};

module.exports = resolvers;
