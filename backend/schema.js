const { gql, UserInputError, AuthenticationError } = require('apollo-server-express')
const { SECRET, NODE_ENV } = require('./utils/config')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('./models/user')
const Chat = require('./models/chat')
const Comment = require('./models/comment')
const { PubSub } = require('apollo-server-express');
const pubsub = new PubSub()
const { GraphQLScalarType } = require('graphql')
const { Kind } = require('graphql/language')
const typeDefs = gql`
    scalar Date

    type User {
        username: String!
        id: ID!
    }

    type Chat {
        title: String!
        comments: [Comment!]!
        id: ID!
    }

    type Comment {
        user: User!
        date: Date!
        content: String!
        id: ID!
    }
  
    type Token {
        value: String!
        user: User!
    }

    type Query {
        me: User
        chats: [Chat!]!
        comments(chatTitle: String): [Comment!]!
    }

    type Mutation {
        createUser(
            username: String!
            password: String!
        ): Token
        login(
            username: String!
            password: String!
        ): Token
        createChat(
            chatTitle: String!
        ): Chat
        createComment(
            chatTitle: String!
            content: String!
        ): Comment
    }  

    type Subscription {
        commentAdded: Comment!
    }
`

    




const resolvers = {
    Date: new GraphQLScalarType({
        name: 'Date',
        parseValue(value) {
            return new Date(value)
        },
        serialize(value) {
            return value.getTime()
        },
        parseLiteral(ast) {
            if (ast.kind === Kind.INT) {
                return parseInt(ast.value, 10)
            }
            return null
        }
    }),
    Query: {
        me: (root, args, context) => {
            return context.currentUser
        },
        chats: async (root, args, { currentUser }) => {
            if (!currentUser) {
                throw new AuthenticationError("Not authenticated")
            }
            return await Chat.find({}).populate({
                path: 'comments',
                model: 'Comment',
                populate: {
                    path: 'user',
                    model: 'User'
                }
            })
        },
        comments: async (root, args, { currentUser }) => {
            if (!currentUser) {
                throw new AuthenticationError("Not authenticated")
            }
            if (args.chatTitle) {
                const chat = await Chat.findOne({ title: args.chatTitle }).populate({
                    path: 'comments',
                    model: 'Comment',
                    populate: {
                        path: 'user',
                        model: 'User'
                    }
                })
                return chat.comments
            }
            return await Comment.find({}).populate('user', { username: 1 })
        }
    },
    Mutation: {
        createUser: async (root, args) => {
            const saltRounds = 10
            const password = await bcrypt.hash(args.password, saltRounds)
            const user = new User({ username: args.username, password })
            return user.save().then(res => {
                const userForToken = {
                    username: res.username,
                    id: res._id,
                }
                return { value: jwt.sign(userForToken, SECRET), user: { username: res.username } }
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
        },
        createChat: async (root, args, { currentUser }) => {
            if (!currentUser) {
                throw new AuthenticationError("Not authenticated")
            }
            const chat = new Chat({ title: args.chatTitle, comments: [] })
            return chat.save().catch(error => {
                throw new UserInputError('Title must be at least 3 characters long and unique')
            })
        },
        createComment: async (root, args, { currentUser }) => {
            if (!currentUser) {
                throw new AuthenticationError("Not authenticated")
            }
            const chat = await Chat.findOne({ title: args.chatTitle })
            if (!chat) {
                throw new UserInputError('Chat does not exist')
            }
            const comment = new Comment({ user: currentUser, content: args.content, date: new Date })
            return comment.save().then(async res => {
                await Chat.findOneAndUpdate({ title: chat.title }, { comments: chat.comments.concat(res._id) })
                pubsub.publish('COMMENT_ADDED', { commentAdded: res })
                return res
            }).catch(error => {
                throw new UserInputError('Content of comment must be at least 1 characters long')
            })
        }
    },
    
    Subscription: {
        commentAdded: {
            subscribe: () => pubsub.asyncIterator(['COMMENT_ADDED'])
        }
    }
    
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
