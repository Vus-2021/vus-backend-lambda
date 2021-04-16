const formatError = (err) => {
    console.error(' --- 🛠   GraphQL Error   🛠  ---');
    console.error('Path:', err.path);
    console.error('Message:', err.message);
    console.error('Code:', err.extensions.code);
    //   console.error('StackTrace:', err.extensions.exception.stacktrace);
    console.error('Original Error', err.originalError);
    return err;
};

module.exports = formatError;
