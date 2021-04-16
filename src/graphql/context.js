const jwt = require('../modules/jwt');

const TOKEN_EXPIRED = -3;
const TOKEN_INVALID = -2;

const context = async ({ headers }) => {
    if (!headers.authorization) return { user: undefined };
    const user = await jwt.verify(headers.authorization);
    if (user === TOKEN_EXPIRED)
        return { success: false, user: undefined, message: 'token expired' };
    else if (user === TOKEN_INVALID)
        return { success: false, user: undefined, message: 'token invalid' };
    else if (user.userId === undefined)
        return { success: false, user: undefined, message: 'undefined' };
    return { success: true, message: 'pass', user };
};

module.exports = context;
