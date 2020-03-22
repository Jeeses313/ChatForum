const { PORT } = require('./utils/config')
const schema = require('./schema')
const app = require('./app')
const { ApolloServer } = require('apollo-server-express');
const server = new ApolloServer(schema)
server.applyMiddleware({ app })
const http = require('http')
const httpServer = http.createServer(app);
const { NODE_ENV } = require('./utils/config')
server.installSubscriptionHandlers(httpServer);
httpServer.listen(PORT, () => {
    if (NODE_ENV === "development") {
        console.log(`Playground ready at http://localhost:${PORT}${server.graphqlPath}`)
    }
    console.log(`Server ready at http://localhost:${PORT}`)
    console.log(`Subscriptions ready at ws://localhost:${PORT}${server.subscriptionsPath}`)
})
