require('dotenv').config();
module.exports = {
    create: require(`./${process.env.DB}/create`),
    deleteItem: require(`./${process.env.DB}/deleteItem`),
    get: require(`./${process.env.DB}/get`),
    update: require(`./${process.env.DB}/update`),
    query: require(`./${process.env.DB}/query`),
    transaction: require(`./${process.env.DB}/transaction`),
};
