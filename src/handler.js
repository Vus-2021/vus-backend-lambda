const { ApolloServer } = require('apollo-server-lambda');
const schema = require('./graphql/mergeSchema');
const formatError = require('./graphql/formatError');
const auth = require('./graphql/context');
const dbConnect = require('./model/dbConnect');

dbConnect(process.env.DB)
    .then(() => console.log(`🚀  ${process.env.DB} is ready`))
    .catch((err) => console.log(`🧨  ${process.env.DB} error`, err.console));

const server = new ApolloServer({
    schema,
    formatError,
    context: async ({ event, context }) => {
        return {
            headers: event.headers,
            functionName: context.functionName,
            event,
            context,
            user: (await auth({ headers: event.headers })).user,
        };
    },
    playground: {
        endpoint: '/dev/graphql',
    },
});

exports.graphqlHandler = server.createHandler({
    cors: {
        origin: '*',
        credentials: true,
    },
});
