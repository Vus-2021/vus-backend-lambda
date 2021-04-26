const AWS = require('aws-sdk');

AWS.config.update({ region: 'ap-northeast-2' });

const { transaction } = require('../../../services');
const dateNow = require('../../../modules/dateNow');

const resolvers = {
    Mutation: {
        createDriverLocation: async (parent, args) => {
            const { preKey, destinationKey, locationIndex, route } = args.input;
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

                if (success) {
                    const params = {
                        Message: route,
                        TopicArn: process.env.AWS_SNS_ARN,
                    };

                    const publishTextPromise = new AWS.SNS({ apiVersion: '2010-03-31' })
                        .publish(params)
                        .promise();

                    publishTextPromise
                        .then((data) => {
                            console.log(
                                `Message ${params.Message} sent to the topic ${params.TopicArn}`
                            );
                            console.log('MessageID is ' + data.MessageId);
                        })
                        .catch((err) => {
                            console.error('err', err);
                        });
                }
                return { success, message, code };
            } catch (error) {
                return { success: false, message: 'asda', code: 500 };
            }
        },
    },
};

module.exports = resolvers;
