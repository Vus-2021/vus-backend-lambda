const { deleteItem } = require('../../../../services');

const resolvers = {
    Mutation: {
        deleteNotice: async (_, args, { user }) => {
            if (!user || user.type !== 'ADMIN') {
                return { success: false, message: 'access denied', code: 403 };
            }
            const noticeList = args.partitionKey.map((item) => {
                return {
                    partitionKey: item,
                    sortKey: '#notice',
                };
            });
            let { success, message, code } = {};
            try {
                for (let notice of noticeList) {
                    ({ success, message, code } = await deleteItem({
                        notice,
                        tableName: process.env.TABLE_NAME,
                    }));
                }
                return { success, message, code };
            } catch (error) {
                return { success: false, message: error.message, code: 500 };
            }
        },
    },
};

module.exports = resolvers;
