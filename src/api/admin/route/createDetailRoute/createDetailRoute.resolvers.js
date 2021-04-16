const uuid = require('uuid');

const { create } = require('../../../../services');
const uploadS3 = require('../../../../modules/s3');
const resolvers = {
    Mutation: {
        createRouteDetail: async (_, args, { user }) => {
            if (!user || user.type !== 'ADMIN') {
                return { success: false, message: 'access denied', code: 403 };
            }
            const { location, route, lat, long, boardingTime, file } = args;
            try {
                const [partitionKey, sortKey, gsiSortKey] = [
                    uuid.v4(),
                    '#detail',
                    `#boardingTime#${boardingTime}`,
                ];
                let routeDetail;
                if (!file) {
                    routeDetail = { location, route, lat, long };
                } else {
                    const { createReadStream, filename } = await file;
                    const fileStream = createReadStream();
                    const fileInfo = await uploadS3({ fileStream, filename });
                    routeDetail = {
                        location,
                        route,
                        lat,
                        long,
                        imageUrl: fileInfo.Location,
                    };
                }

                const { success, message, code } = await create({
                    partitionKey,
                    sortKey,
                    gsiSortKey,
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
