const { PORT, NODE_ENV } = require('./utils/config')
const schema = require('./schema')
const app = require('./app')
const { ApolloServer } = require('apollo-server-express');
const server = new ApolloServer(schema)
server.applyMiddleware({ app })
const http = require('http')
const https = require('https')
const configurations = {
    production: { ssl: true, port: PORT, hostname: 'localhost' },
    development: { ssl: false, port: PORT, hostname: 'localhost' }
}
const config = configurations[NODE_ENV]
const fs = require('fs')
let httpServer
if (config.ssl) {
    httpServer = https.createServer({
        key: fs.readFileSync('./key.pem'),
        cert: fs.readFileSync('./certificate.pem')
    }, app)
} else {
    httpServer = http.createServer(app)
}

server.installSubscriptionHandlers(httpServer);
httpServer.listen(config.port, () => {
    if (NODE_ENV === "development") {
        console.log(`Playground ready at http://localhost:${config.port}${server.graphqlPath}`)
        console.log(`Server ready at http://localhost:${config.port}`)
        console.log(`Subscriptions ready at ws://localhost:${config.port}${server.subscriptionsPath}`)
    } else {
        console.log(`Server ready at https://localhost:${config.port}`)
        console.log(`Subscriptions ready at wss://localhost:${config.port}${server.subscriptionsPath}`)
    }

})
