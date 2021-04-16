const {
    mergeTypeDefs,
    mergeResolvers,
    loadFilesSync,
    makeExecutableSchema,
} = require('graphql-tools');

const path = require('path');

const allTypes = loadFilesSync(path.join(__dirname, '../api/**/*.graphql'));
const allResolvers = loadFilesSync(path.join(__dirname, '../api/**/*.resolvers.js'));
let typeDefs = mergeTypeDefs(allTypes);
let resolvers = mergeResolvers(allResolvers);
const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
});

module.exports = schema;
