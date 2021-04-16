const { ApolloServer } = require('apollo-server-lambda');
const schema = require('./graphql/mergeSchema');
//const formatError = require('./graphql/formatError');
const auth = require('./graphql/context');
const dbConnect = require('./model/dbConnect');

dbConnect(process.env.DB)
    .then(() => console.log(`🚀  ${process.env.DB} is ready`))
    .catch((err) => console.log(`🧨  ${process.env.DB} error`, err.console));

const server = new ApolloServer({
    schema,
    context: async ({ event, context }) => {
        return {
            headers: event.headers,
            functionName: context.functionName,
            event,
            context,
            user: await auth({ headers: event.headers }),
        };
    },
    playground: {
        endpoint: '/dev/apollo',
    },
});

exports.graphqlHandler = server.createHandler({
    cors: {
        origin: '*',
        methods: ['POST', 'GET'],
        allowedHeaders: ['Content-Type', 'Origin', 'Accept'],
    },
});
