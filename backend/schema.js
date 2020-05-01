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
        admin: Boolean!
        joinDate: Date!
    }

    type Chat {
        title: String!
        comments: [Comment!]!
        latestComment: Comment
        date: Date!
        id: ID!
        profileChat: Boolean!
        reports: [String!]!
    }

    type Comment {
        user: User!
        date: Date!
        content: String!
        imageUrl: String
        hasVideo: Boolean
        id: ID!
        reports: [String!]!
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
        users: [User!]!
        chats: [Chat!]!
        reportedChats: [Chat!]!
        reportedComments: [Comment!]!
        chat(chatTitle: String!): Chat!
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
            imageUrl: String
        ): Comment
        deleteChat(
            chatId: String!
        ): Chat
        pinChat(
            chatTitle: String!
        ): Chat
        unpinChat(
            chatTitle: String!
        ): Chat
        setUserProfilePic(
            imageUrl: String!
        ): User
        deleteUserProfilePic: User
        reportChat(
            chatTitle: String!
        ): Chat
        unreportChat(
            chatTitle: String!
        ): Chat
        zeroReportChat(
            chatTitle: String!
        ): Chat
        reportComment(
            commentId: String!
        ): Comment
        unreportComment(
            commentId: String!
        ): Comment
        zeroReportComment(
            commentId: String!
        ): Comment
    }  

    type Subscription {
        userCreated: User!
        commentAdded: CommentSub!
        chatAdded: Chat!
        chatDeleted: Chat!
        chatReported: Chat!
        commentDeleted: Comment!
        commentEdited: Comment!
        commentReported: Comment!
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
                throw new AuthenticationError('Not authenticated')
            }
            const user = await User.findOne({ username: args.username })
            if (!user) {
                throw new UserInputError('User does not exist')
            }
            return { id: user.id, username: user.username, imageUrl: user.imageUrl, admin: user.admin, joinDate: user.joinDate }
        },
        users: async (root, args, { currentUser }) => {
            if (!currentUser) {
                throw new AuthenticationError('Not authenticated')
            }
            const users = await User.find({})
            return users.map(user => { return { username: user.username, imageUrl: user.imageUrl, admin: user.admin, joinDate: user.joinDate } })
        },
        chats: async (root, args, { currentUser }) => {
            if (!currentUser) {
                throw new AuthenticationError('Not authenticated')
            }
            return await Chat.find({ profileChat: false }).populate({
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
        reportedChats: async (root, args, { currentUser }) => {
            if (!currentUser || !currentUser.admin) {
                throw new AuthenticationError('Not authenticated')
            }
            return await Chat.find({ reports: { $exists: true, $ne: [] } }).populate({
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
        reportedComments: async (root, args, { currentUser }) => {
            if (!currentUser || !currentUser.admin) {
                throw new AuthenticationError('Not authenticated')
            }
            return await Comment.find({ reports: { $exists: true, $ne: [] } }).populate('user', { username: 1 })
        },
        chat: async (root, args, { currentUser }) => {
            if (!currentUser) {
                throw new AuthenticationError('Not authenticated')
            }
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
            return chat
        },
        pinnedChats: async (root, args, { currentUser }) => {
            if (!currentUser) {
                throw new AuthenticationError('Not authenticated')
            }
            return Chat.find({ title: { $in: currentUser.pinnedChats.map(chat => chat.title) } }).populate({
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
        }
    },
    Mutation: {
        createUser: async (root, args) => {
            if (args.password.length < 3 || args.password.length > 15) {
                throw new UserInputError('Username and password must be 3-15 characters long and username must be unique')
            }
            const saltRounds = 10
            const password = await bcrypt.hash(args.password, saltRounds)
            const user = new User({ username: args.username, password, pinnedChats: [], admin: false, joinDate: new Date })
            return user.save().then(async res => {
                const userForToken = {
                    username: res.username,
                    id: res._id,
                }
                const userChat = new Chat({ title: `userChat${res.username}`, comments: [], date: new Date, profileChat: true })
                await userChat.save()
                pubsub.publish('USER_CREATED', { userCreated: { username: res.username, imageUrl: res.imageUrl, admin: res.admin, joinDate: res.joinDate } })
                return { value: jwt.sign(userForToken, SECRET), user: { id: res.id, username: res.username, pinnedChats: [], admin: false, joinDate: res.joinDate } }
            })
                .catch(error => {
                    throw new UserInputError('Username and password must be 3-15 characters long and username must be unique')
                })
        },
        login: async (root, args) => {
            const user = await User.findOne({ username: args.username }).populate('pinnedChats', { title: 1 })

            if (!user || !(await bcrypt.compare(args.password, user.password))) {
                throw new UserInputError("Wrong credentials")
            }

            const userForToken = {
                username: user.username,
                id: user._id,
            }

            return { value: jwt.sign(userForToken, SECRET), user: { id: user.id, username: user.username, pinnedChats: user.pinnedChats, admin: user.admin, joinDate: user.joinDate } }
        },
        createChat: async (root, args, { currentUser }) => {
            if (!currentUser) {
                throw new AuthenticationError('Not authenticated')
            }
            if (args.chatTitle.startsWith('userChat')) {
                throw new UserInputError('Title cannot start with userChat')
            }
            const chat = new Chat({ title: args.chatTitle, comments: [], date: new Date, profileChat: false, reports: [] })
            return chat.save().then(async res => {
                pubsub.publish('CHAT_ADDED', { chatAdded: res })
                return res
            }).catch(error => {
                throw new UserInputError('Title must be 3-30 characters long and unique')
            })
        },
        deleteChat: async (root, args, { currentUser }) => {
            if (!currentUser || !currentUser.admin) {
                throw new AuthenticationError('Not authenticated')
            }
            const chat = await Chat.findById(args.chatId).populate('comments')
            if (!chat) {
                return
            }
            if (chat.profileChat) {
                throw new UserInputError('Profile chats cannot be deleted')
            }
            return Chat.findByIdAndDelete(chat.id).then(async res => {
                const commentIds = chat.comments.map(comment => comment.id)
                await Comment.deleteMany({ _id: { $in: commentIds } })
                pubsub.publish('CHAT_DELETED', { chatDeleted: chat })
                return chat
            })
        },
        createComment: async (root, args, { currentUser }) => {
            if (!currentUser) {
                throw new AuthenticationError('Not authenticated')
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
                    throw new UserInputError('Image or video does not exist')
                }
                if (!res.headers['content-type'].startsWith('image')) {
                    const getId = (url) => {
                        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
                        const match = url.match(regExp);

                        return (match && match[2].length === 11)
                            ? match[2]
                            : null;
                    }
                    const videoId = getId(args.imageUrl)
                    if (!videoId) {
                        throw new UserInputError('Image or video does not exist')
                    }
                    comment = new Comment({ user: currentUser, content: args.content, date: new Date, imageUrl: `https://www.youtube.com/embed/${videoId}`, hasVideo: true })
                } else {
                    comment = new Comment({ user: currentUser, content: args.content, date: new Date, imageUrl: args.imageUrl, hasVideo: false })
                }
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
            if (!currentUser || (comment.user.username !== currentUser.username && !currentUser.admin)) {
                throw new AuthenticationError('Not authenticated')
            }
            return Comment.findByIdAndUpdate(comment.id, { content: 'Comment deleted', imageUrl: null, reports: [] }, { new: true }).then(async res => {
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
                throw new AuthenticationError('Not authenticated')
            }
            if (args.content === '') {
                throw new UserInputError('Content of comment must be at least 1 characters long')
            }
            if (comment.imageUrl !== args.imageUrl) {
                let imageUrl = ''
                let hasVideo = false
                if (args.imageUrl && args.imageUrl !== '') {
                    let res
                    try {
                        res = await axios.get(args.imageUrl)
                    } catch (e) {
                        throw new UserInputError('Image or video does not exist')
                    }
                    if (!res.headers['content-type'].startsWith('image')) {
                        const getId = (url) => {
                            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
                            const match = url.match(regExp);

                            return (match && match[2].length === 11)
                                ? match[2]
                                : null;
                        }
                        const videoId = getId(args.imageUrl)
                        if (!videoId) {
                            throw new UserInputError('Image or video does not exist')
                        }
                        hasVideo = true
                        imageUrl = `https://www.youtube.com/embed/${videoId}`
                    } else {
                        imageUrl = args.imageUrl
                    }
                }
                return Comment.findByIdAndUpdate(comment.id, { content: `${args.content} -edited`, imageUrl: imageUrl, hasVideo: hasVideo }, { new: true }).then(async res => {
                    pubsub.publish('COMMENT_EDITED', { commentEdited: res })
                    return res
                })
            }
            return Comment.findByIdAndUpdate(comment.id, { content: `${args.content} -edited` }, { new: true }).then(async res => {
                pubsub.publish('COMMENT_EDITED', { commentEdited: res })
                return res
            })
        },
        pinChat: async (root, args, { currentUser }) => {
            if (!currentUser) {
                throw new AuthenticationError('Not authenticated')
            }
            const chat = await Chat.findOne({ title: args.chatTitle })
            if (!chat) {
                throw new UserInputError('Chat does not exist')
            }
            if (chat.profileChat) {
                throw new UserInputError('Profile chats cannot be pinned')
            }
            if (currentUser.pinnedChats.map(pchat => pchat.title).includes(chat.title)) {
                throw new UserInputError('Chat is already pinned')
            }
            await User.findOneAndUpdate({ username: currentUser.username }, { pinnedChats: currentUser.pinnedChats.concat(chat) })
            return chat
        },
        unpinChat: async (root, args, { currentUser }) => {
            if (!currentUser) {
                throw new AuthenticationError('Not authenticated')
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
        },
        setUserProfilePic: async (root, args, { currentUser }) => {
            if (!currentUser) {
                throw new AuthenticationError('Not authenticated')
            }
            let res
            try {
                res = await axios.get(args.imageUrl)
            } catch (e) {
                throw new UserInputError('Image does not exist')
            }
            if (!res.headers['content-type'].startsWith('image')) {
                throw new UserInputError('Image does not exist')
            }
            return User.findOneAndUpdate({ username: currentUser.username }, { imageUrl: args.imageUrl }, { new: true }).then(res => {
                return { username: res.username, pinnedChats: res.pinnedChats, imageUrl: res.imageUrl }
            })
        },
        deleteUserProfilePic: async (root, args, { currentUser }) => {
            if (!currentUser) {
                throw new AuthenticationError('Not authenticated')
            }
            return User.findOneAndUpdate({ username: currentUser.username }, { imageUrl: null }, { new: true }).then(res => {
                return { username: res.username, pinnedChats: res.pinnedChats, imageUrl: res.imageUrl }
            })
        },
        reportChat: async (root, args, { currentUser }) => {
            if (!currentUser) {
                throw new AuthenticationError('Not authenticated')
            }
            const chat = await Chat.findOne({ title: args.chatTitle }).populate({
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
            if (!chat) {
                throw new UserInputError('Chat does not exist')
            }
            if (chat.reports.includes(currentUser.id)) {
                throw new UserInputError('Chat already reported')
            }
            if (chat.profileChat) {
                throw new UserInputError('Profile chats cannot be reported')
            }
            return await Chat.findOneAndUpdate({ title: args.chatTitle }, { reports: chat.reports.concat(currentUser.id) }, { new: true }).then(res => {
                const reportedChat = chat
                reportedChat.reports = chat.reports.concat(currentUser.id)
                pubsub.publish('CHAT_REPORTED', { chatReported: reportedChat })
                return reportedChat
            })
        },
        unreportChat: async (root, args, { currentUser }) => {
            if (!currentUser) {
                throw new AuthenticationError('Not authenticated')
            }
            const chat = await Chat.findOne({ title: args.chatTitle }).populate({
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
            if (!chat) {
                throw new UserInputError('Chat does not exist')
            }
            if (!chat.reports.includes(currentUser.id)) {
                throw new UserInputError('Chat is not reported')
            }
            return await Chat.findOneAndUpdate({ title: args.chatTitle }, { reports: chat.reports.filter(id => id !== currentUser.id) }, { new: true }).then(res => {
                const reportedChat = chat
                reportedChat.reports = chat.reports.filter(id => id !== currentUser.id)
                pubsub.publish('CHAT_REPORTED', { chatReported: reportedChat })
                return reportedChat
            })
        },
        zeroReportChat: async (root, args, { currentUser }) => {
            if (!currentUser || !currentUser.admin) {
                throw new AuthenticationError('Not authenticated')
            }
            const chat = await Chat.findOne({ title: args.chatTitle }).populate({
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
            if (!chat) {
                throw new UserInputError('Chat does not exist')
            }
            if (chat.reports.length === 0) {
                throw new UserInputError('Chat is not reported')
            }
            return await Chat.findOneAndUpdate({ title: args.chatTitle }, { reports: [] }, { new: true }).then(res => {
                const reportedChat = chat
                reportedChat.reports = []
                pubsub.publish('CHAT_REPORTED', { chatReported: reportedChat })
                return reportedChat
            })
        },
        reportComment: async (root, args, { currentUser }) => {
            if (!currentUser) {
                throw new AuthenticationError('Not authenticated')
            }
            const comment = await Comment.findById(args.commentId).populate('user', { username: 1 })
            if (!comment) {
                throw new UserInputError('Comment does not exist')
            }
            if (comment.reports.includes(currentUser.id)) {
                throw new UserInputError('Comment already reported')
            }
            return await Comment.findByIdAndUpdate(args.commentId, { reports: comment.reports.concat(currentUser.id) }, { new: true }).then(res => {
                const reportedComment = comment
                reportedComment.reports = comment.reports.concat(currentUser.id)
                pubsub.publish('COMMENT_REPORTED', { commentReported: reportedComment })
                return reportedComment
            })
        },
        unreportComment: async (root, args, { currentUser }) => {
            if (!currentUser) {
                throw new AuthenticationError('Not authenticated')
            }
            const comment = await Comment.findById(args.commentId).populate('user', { username: 1 })
            if (!comment) {
                throw new UserInputError('Comment does not exist')
            }
            if (!comment.reports.includes(currentUser.id)) {
                throw new UserInputError('Comment is not reported')
            }
            return await Comment.findByIdAndUpdate(args.commentId, { reports: comment.reports.filter(id => id !== currentUser.id) }, { new: true }).then(res => {
                const reportedComment = comment
                reportedComment.reports = comment.reports.filter(id => id !== currentUser.id)
                pubsub.publish('COMMENT_REPORTED', { commentReported: reportedComment })
                return reportedComment
            })
        },
        zeroReportComment: async (root, args, { currentUser }) => {
            if (!currentUser || !currentUser.admin) {
                throw new AuthenticationError('Not authenticated')
            }
            const comment = await Comment.findById(args.commentId).populate('user', { username: 1 })
            if (!comment) {
                throw new UserInputError('Comment does not exist')
            }
            if (comment.reports.length === 0) {
                throw new UserInputError('Comment is not reported')
            }
            return await Comment.findByIdAndUpdate(args.commentId, { reports: [] }, { new: true }).then(res => {
                const reportedComment = comment
                reportedComment.reports = []
                pubsub.publish('COMMENT_REPORTED', { commentReported: reportedComment })
                return reportedComment
            })
        }
    },

    Subscription: {
        userCreated: {
            subscribe: () => pubsub.asyncIterator(['USER_CREATED'])
        },
        commentAdded: {
            subscribe: () => pubsub.asyncIterator(['COMMENT_ADDED'])
        },
        chatAdded: {
            subscribe: () => pubsub.asyncIterator(['CHAT_ADDED'])
        },
        chatDeleted: {
            subscribe: () => pubsub.asyncIterator(['CHAT_DELETED'])
        },
        chatReported: {
            subscribe: () => pubsub.asyncIterator(['CHAT_REPORTED'])
        },
        commentDeleted: {
            subscribe: () => pubsub.asyncIterator(['COMMENT_DELETED'])
        },
        commentEdited: {
            subscribe: () => pubsub.asyncIterator(['COMMENT_EDITED'])
        },
        commentReported: {
            subscribe: () => pubsub.asyncIterator(['COMMENT_REPORTED'])
        },
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
