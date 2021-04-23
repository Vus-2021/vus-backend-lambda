const { update } = require('../../../../services');
const resolvers = {
    Mutation: {
        updateDetailRoute: async (
            _,
            { partitionKey, boardingTime, lat, long, location, route, imageUrl },
            { user }
        ) => {
            if (!user || user.type !== 'ADMIN') {
                return { success: false, message: 'access denied', code: 403 };
            }

            let updateItem = Object.assign({
                gsiSortKey: `#boardingTime#${boardingTime}`,
                lat,
                long,
                location,
                route,
                imageUrl,
            });

            try {
                const { success, message, code } = await update({
                    primaryKey: { partitionKey, sortKey: '#detail' },
                    updateItem,
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
