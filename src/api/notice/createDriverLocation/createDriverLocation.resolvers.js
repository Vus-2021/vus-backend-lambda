const AWS = require('aws-sdk');

AWS.config.update({ region: 'ap-northeast-2' });

const { transaction } = require('../../../services');
const dateNow = require('../../../modules/dateNow');

const resolvers = {
    Mutation: {
        createDriverLocation: async (parent, args) => {
            const { preKey, destinationKey, locationIndex, route } = args.input;
            let { success, message, code } = {};
            const updatedAt = dateNow();
            const Update = [];
            if (preKey) {
                Update.push({
                    primaryKey: {
                        partitionKey: preKey,
                        sortKey: `#detail`,
                    },
                    method: 'SET',
                    updateItem: { currentLocation: false },
                });
            }
            if (destinationKey) {
                Update.push({
                    primaryKey: {
                        partitionKey: destinationKey,
                        sortKey: '#detail',
                    },
                    method: 'SET',
                    updateItem: { currentLocation: true, updatedAt, locationIndex },
                });
            }
            try {
                ({ success, message, code } = await transaction({
                    Update,
                    tableName: process.env.TABLE_NAME,
                }));
            } catch (error) {
                return { success: false, message: 'asda', code: 500 };
            }

            if (success) {
                const params = {
                    Message: route,
                    TopicArn: process.env.AWS_SNS_ARN,
                };
                try {
                    const publishTextPromise = new AWS.SNS({ apiVersion: '2010-03-31' })
                        .publish(params)
                        .promise();
                    const result = await publishTextPromise;
                    console.log(
                        `Message ${params.Message} sent to the topic ${params.TopicArn} MessageID is ' ${result.MessageId}`
                    );
                } catch (error) {
                    console.error('err', error);
                    return { success: false, message: 'sns send failed', code: 500 };
                }
            }

            return { success, message, code };
        },
    },
};

module.exports = resolvers;
