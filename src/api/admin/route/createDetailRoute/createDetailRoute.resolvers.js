const uuid = require('uuid');

const { create } = require('../../../../services');
const resolvers = {
    Mutation: {
        createRouteDetail: async (_, args, { user }) => {
            if (!user || user.type !== 'ADMIN') {
                return { success: false, message: 'access denied', code: 403 };
            }
            const { location, route, lat, long, boardingTime, imageUrl } = args;
            try {
                const [partitionKey, sortKey, gsiSortKey] = [
                    uuid.v4(),
                    '#detail',
                    `#boardingTime#${boardingTime}`,
                ];
                const routeDetail = { location, route, lat, long, imageUrl };

                const { success, message, code } = await create({
                    partitionKey,
                    sortKey,
                    gsiSortKey,
                    tableName: process.env.TABLE_NAME,
                    ...routeDetail,
                });

                return { success, message, code };
            } catch (error) {
                return { success: false, message: error.message, code: 500 };
            }
        },
    },
};

module.exports = resolvers;
