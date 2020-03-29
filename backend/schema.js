const { gql, UserInputError, AuthenticationError } = require('apollo-server-express')
const { SECRET, NODE_ENV } = require('./utils/config')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const axios = require('axios')
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
        pinnedChats: [Chat!]!
        imageUrl: String
        id: ID!
    }

    type Chat {
        title: String!
        comments: [Comment!]!
        latestComment: Comment
        date: Date!
        id: ID!
    }

    type Comment {
        user: User!
        date: Date!
        content: String!
        imageUrl: String
        id: ID!
    }

    type CommentSub {
        comment: Comment!
        chatTitle: String!
    }
  
    type Token {
        value: String!
        user: User!
    }

    type Query {
        me: User
        user(username: String!): User!
        chats: [Chat!]!
        comments(chatTitle: String): [Comment!]!
        pinnedChats: [Chat!]!
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
            imageUrl: String
        ): Comment
        deleteComment(
            commentId: String!
        ): Comment
        editComment(
            commentId: String!
            content: String!
        ): Comment
        pinChat(
            chatTitle: String!
        ): Chat
        unpinChat(
            chatTitle: String!
        ): Chat
    }  

    type Subscription {
        commentAdded: CommentSub!
        chatAdded: Chat!
        commentDeleted: Comment!
        commentEdited: Comment!
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
        user: async (root, args, { currentUser }) => {
            if (!currentUser) {
                throw new AuthenticationError("Not authenticated")
            }
            const user = await User.findOne({ username: args.username })
            if (!user) {
                throw new UserInputError('User does not exist')
            }
            return { username: user.username, imageUrl: user.imageUrl }
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
            }).populate({
                path: 'latestComment',
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
                if (!chat) {
                    throw new UserInputError('Chat does not exist')
                }
                return chat.comments
            }
            return await Comment.find({}).populate('user', { username: 1 })
        },
        pinnedChats: async (root, args, { currentUser }) => {
            if (!currentUser) {
                throw new AuthenticationError("Not authenticated")
            }
            return currentUser.pinnedChats
        }
    },
    Mutation: {
        createUser: async (root, args) => {
            if (args.password.length < 3) {
                throw new UserInputError('Username and password must be 3-15 characters long and username must be unique')
            }
            const saltRounds = 10
            const password = await bcrypt.hash(args.password, saltRounds)
            const user = new User({ username: args.username, password, pinnedChats: [] })
            return user.save().then(res => {
                const userForToken = {
                    username: res.username,
                    id: res._id,
                }
                return { value: jwt.sign(userForToken, SECRET), user: { username: res.username, pinnedChats: [] } }
            })
                .catch(error => {
                    throw new UserInputError('Username and password must be 3-15 characters long and username must be unique')
                })
        },
        login: async (root, args) => {
            const user = await User.findOne({ username: args.username }).populate('pinnedChats', { title: 1 })

            if (!user || !(await bcrypt.compare(args.password, user.password))) {
                throw new UserInputError("wrong credentials")
            }

            const userForToken = {
                username: user.username,
                id: user._id,
            }

            return { value: jwt.sign(userForToken, SECRET), user: { username: user.username, pinnedChats: user.pinnedChats } }
        },
        createChat: async (root, args, { currentUser }) => {
            if (!currentUser) {
                throw new AuthenticationError("Not authenticated")
            }
            const chat = new Chat({ title: args.chatTitle, comments: [], date: new Date })
            return chat.save().then(async res => {
                pubsub.publish('CHAT_ADDED', { chatAdded: res })
                return res
            }).catch(error => {
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
            let comment
            if (args.imageUrl && args.imageUrl !== '') {
                let res
                try {
                    res = await axios.get(args.imageUrl)
                } catch (e) {
                    throw new UserInputError('Image does not exist')
                }
                if (!res.headers['content-type'].startsWith('image')) {
                    throw new UserInputError('Image does not exist')
                }
                comment = new Comment({ user: currentUser, content: args.content, date: new Date, imageUrl: args.imageUrl })
            } else {
                comment = new Comment({ user: currentUser, content: args.content, date: new Date })
            }
            return comment.save().then(async res => {
                await Chat.findOneAndUpdate({ title: chat.title }, { comments: chat.comments.concat(res._id), latestComment: res })
                pubsub.publish('COMMENT_ADDED', { commentAdded: { comment: res, chatTitle: args.chatTitle } })
                return res
            }).catch(error => {
                throw new UserInputError('Content of comment must be at least 1 characters long')
            })
        },
        deleteComment: async (root, args, { currentUser }) => {
            const comment = await Comment.findById(args.commentId).populate('user', { username: 1 })
            if (!comment) {
                return
            }
            if (!currentUser || (comment.user.username !== currentUser.username)) {
                throw new AuthenticationError("Not authenticated")
            }
            return Comment.findByIdAndUpdate(comment.id, { content: 'Comment deleted', imageUrl: null }, { new: true }).then(async res => {
                pubsub.publish('COMMENT_DELETED', { commentDeleted: res })
                return res
            })
        },
        editComment: async (root, args, { currentUser }) => {
            const comment = await Comment.findById(args.commentId).populate('user', { username: 1 })
            if (!comment) {
                return
            }
            if (!currentUser || (comment.user.username !== currentUser.username)) {
                throw new AuthenticationError("Not authenticated")
            }
            if (args.content === '') {
                throw new UserInputError('Content of comment must be at least 1 characters long')
            }
            return Comment.findByIdAndUpdate(comment.id, { content: args.content }, { new: true }).then(async res => {
                pubsub.publish('COMMENT_EDITED', { commentEdited: res })
                return res
            })
        },
        pinChat: async (root, args, { currentUser }) => {
            if (!currentUser) {
                throw new AuthenticationError("Not authenticated")
            }
            const chat = await Chat.findOne({ title: args.chatTitle })
            if (!chat) {
                throw new UserInputError('Chat does not exist')
            }
            if (currentUser.pinnedChats.map(pchat => pchat.title).includes(chat.title)) {
                throw new UserInputError('Chat is already pinned')
            }
            await User.findOneAndUpdate({ username: currentUser.username }, { pinnedChats: currentUser.pinnedChats.concat(chat) })
            return chat
        },
        unpinChat: async (root, args, { currentUser }) => {
            if (!currentUser) {
                throw new AuthenticationError("Not authenticated")
            }
            const chat = await Chat.findOne({ title: args.chatTitle })
            if (!chat) {
                throw new UserInputError('Chat does not exist')
            }
            if (!currentUser.pinnedChats.map(pchat => pchat.title).includes(chat.title)) {
                throw new UserInputError('Chat is not pinned')
            }
            await User.findOneAndUpdate({ username: currentUser.username }, { pinnedChats: currentUser.pinnedChats.filter(fchat => fchat.title !== chat.title) })
            return chat
        }
    },

    Subscription: {
        commentAdded: {
            subscribe: () => pubsub.asyncIterator(['COMMENT_ADDED'])
        },
        chatAdded: {
            subscribe: () => pubsub.asyncIterator(['CHAT_ADDED'])
        },
        commentDeleted: {
            subscribe: () => pubsub.asyncIterator(['COMMENT_DELETED'])
        },
        commentEdited: {
            subscribe: () => pubsub.asyncIterator(['COMMENT_EDITED'])
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
            const currentUser = await User.findById(decodedToken.id).populate('pinnedChats', { title: 1 })
            return { currentUser }
        }
    },
    playground: NODE_ENV === "development"
}

module.exports = schema
