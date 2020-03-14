const { gql, UserInputError, AuthenticationError } = require('apollo-server-express')
const { SECRET, NODE_ENV } = require('./utils/config')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('./models/user')
const { PubSub } = require('apollo-server-express');
const pubsub = new PubSub()
const typeDefs = gql`
    type User {
        username: String!
        id: ID!
    }
  
    type Token {
        value: String!
        user: User!
    }

    type Query {
        me: User
    }

    type Mutation {
        createUser(
            username: String!
            password: String!
        ): User
        login(
            username: String!
            password: String!
        ): Token
    }   
`
/*
    type Subscription {
        userAdded: User!
    }
*/



const resolvers = {
    Query: {
        me: (root, args, context) => {
            return context.currentUser
        }
    },
    Mutation: {
        createUser: async (root, args) => {
            const saltRounds = 10
            const password = await bcrypt.hash(args.password, saltRounds)
            const user = new User({ username: args.username, password })
            return user.save().then(res => {
                pubsub.publish('USER_ADDED', { userAdded: user.toJSON() })
                return res.toJSON()
            })
            .catch(error => {
                throw new UserInputError('Username and password must be at least 3 characters long and username must be unique')
            })
        },
        login: async (root, args) => {
            const user = await User.findOne({ username: args.username })

            if (!user || !(await bcrypt.compare(args.password, user.password))) {
                throw new UserInputError("wrong credentials")
            }

            const userForToken = {
                username: user.username,
                id: user._id,
            }

            return { value: jwt.sign(userForToken, SECRET), user: { username: user.username } }
        }
    },
    /*
    Subscription: {
        userAdded: {
            subscribe: () => pubsub.asyncIterator(['USER_ADDED'])
        }
    }
    */
}


const schema = {
    typeDefs,
    resolvers,
    context: async ({ req }) => {
        const auth = req ? req.headers.authorization : null
        if (auth && auth.toLowerCase().startsWith('bearer ')) {
            const decodedToken = jwt.verify(auth.substring(7), SECRET)
            const currentUser = await User.findById(decodedToken.id)
            return { currentUser }
        }
    },
    playground: NODE_ENV === "development"
}

module.exports = schema
