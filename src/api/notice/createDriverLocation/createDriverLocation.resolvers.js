const { transaction } = require('../../../services');
const dateNow = require('../../../modules/dateNow');

const resolvers = {
    Mutation: {
        createDriverLocation: async (parent, args) => {
            const { preKey, destinationKey, locationIndex } = args.input;

            const updatedAt = dateNow();
            const Update = [
                {
                    primaryKey: {
                        partitionKey: preKey,
                        sortKey: `#detail`,
                    },
                    method: 'SET',
                    updateItem: { currentLocation: false },
                },
                {
                    primaryKey: {
                        partitionKey: destinationKey,
                        sortKey: '#detail',
                    },
                    method: 'SET',
                    updateItem: { currentLocation: true, updatedAt, locationIndex },
                },
            ];
            try {
                const { success, message, code } = await transaction({
                    Update,
                    tableName: process.env.TABLE_NAME,
                });
                return { success, message, code };
            } catch (error) {
                return { success: false, message: 'asda', code: 500 };
            }
        },
    },
};

module.exports = resolvers;
