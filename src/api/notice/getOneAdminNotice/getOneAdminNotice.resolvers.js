const { get } = require('../../../services');
const resolvers = {
    Query: {
        getOneAdminNotice: async (parent, { partitionKey }) => {
            try {
                const { success, message, code, data } = await get({
                    partitionKey,
                    sortKey: '#notice',
                });

                Object.assign(data, {
                    createdAt: data.gsiSortKey.split('#')[2],
                });
                return { success, message, code, data };
            } catch (error) {
                return { success: false, message: error.message, code: 500 };
            }
        },
    },
};

module.exports = resolvers;
