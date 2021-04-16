const dynamoose = require('dynamoose');
const dotenv = require('dotenv');

dotenv.config();

dynamoose.aws.sdk.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const Schema = new dynamoose.Schema(
    {
        partitionKey: {
            type: String,
            hashKey: true,
        },
        sortKey: {
            type: String,
            rangeKey: true,
            index: {
                global: true,
                name: 'sk-index',
                rangeKey: 'gsiSortKey',
            },
        },
        gsiSortKey: String,
    },
    {
        saveUnknown: true,
        timestamps: false,
    }
);
module.exports = dynamoose.model('TEST-vus', Schema);
