const uploadS3 = require('../../../modules/s3');

const resolvers = {
    Mutation: {
        singleUpload: async (_, { file }) => {
            try {
                const { createReadStream, filename, mimetype, encoding } = await file;
                const fileStream = createReadStream();
                const data = await uploadS3({ fileStream, filename });
                return { filename, mimetype, url: data.Location, encoding };
            } catch (error) {
                console.log(error);
                return { filename: null, mimetype: null, url: 'null', encoding: null };
            }
        },
    },
};

module.exports = resolvers;
