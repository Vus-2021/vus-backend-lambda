const crypto = require('crypto');

module.exports.getSalt = () => crypto.randomBytes(32).toString('hex');

module.exports.getHashedPassword = (password, salt) => {
    return new Promise((resolve, reject) => {
        crypto.pbkdf2(password, salt, 10000, 23, 'sha512', (err, key) => {
            resolve(key.toString('base64'));
            if (err) reject(err);
        });
    });
};
