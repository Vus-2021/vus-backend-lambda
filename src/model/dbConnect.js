const mongoose = require('mongoose');
const dotenv = require('dotenv');

let db;
const dbConnect = (database) =>
    new Promise((resolve, reject) => {
        if (database === 'mongodb') {
            dotenv.config();
            mongoose.set('useCreateIndex', true);
            mongoose.connect(
                `mongodb+srv://ridiServer:${process.env.mongodb_pw}@cluster0.kcu9a.mongodb.net/Vatech`,
                {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    useFindAndModify: false,
                }
            );

            db = mongoose.connection;
            db.on('error', () => {
                reject(console);
            });
            db.once('open', () => {
                resolve(true);
            });
        } else {
            resolve(true);
        }
    });
module.exports = dbConnect;
