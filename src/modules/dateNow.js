const dayjs = require('dayjs');

const dateNow = function (incrementTime) {
    const hour = incrementTime || 0;
    return dayjs(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }))
        .add(hour, 'h')
        .format('YYYY-MM-DD HH:mm:ss');
};

module.exports = dateNow;
