const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        maxlength: 30
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment'
        }
    ],
    date: {
        type: Date,
        required: true
    },
    latestComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    },
    profileChat: {
        type: Boolean,
        required: true
    },
    reports: [
        { 
            type: String 
        }
    ]
})

schema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Chat', schema)