const AWS = require('aws-sdk');
const dotenv = require('dotenv');
dotenv.config();

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const uploadS3 = ({ fileStream, filename }) => {
    const params = {
        Bucket: 'test-vus',
        Key: `images/origin/${Date.now()}.${filename.split('.').pop()}`,
        Body: fileStream,
        ACL: 'public-read',
    };

    const fileInfo = s3
        .upload(params)
        .promise()
        .then((data) => {
            return data;
        })
        .catch((err) => {
            console.log(err);
            throw err;
        });

    return fileInfo;
};

module.exports = uploadS3;
