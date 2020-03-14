const { PORT } = require('./utils/config')
const schema = require('./schema')
const app = require('./app')
const { ApolloServer } = require('apollo-server-express');
const server = new ApolloServer(schema)
server.applyMiddleware({ app })
const http = require('http')
const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);
httpServer.listen(PORT, () => {
    console.log(`Server ready at http://localhost:${PORT}/${server.graphqlPath}`)
    console.log(`Subscriptions ready at ws://localhost:${PORT}/${server.subscriptionsPath}`)
})
