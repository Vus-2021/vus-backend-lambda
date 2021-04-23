const vus = require('../../model/mongodb');

const deleteItem = async ({ tableName, ...args }) => {
    try {
        await vus.deleteOne(args);
        return { success: true, message: '삭제 성공', code: 204 };
    } catch (error) {
        console.log(error);
        return { success: false, message: '서버 에러', code: 500 };
    }
};

module.exports = deleteItem;
