/* eslint-disable no-unused-vars */
const vus = require('../../model/dynamoose');

const deleteItem = async ({ tableName, ...args }) => {
    try {
        await vus.delete(args);
        return { success: true, message: '삭제 성공', code: 204 };
    } catch (error) {
        return { success: false, message: '서버 에러', code: 500 };
    }
};

module.exports = deleteItem;
