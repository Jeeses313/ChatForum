const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    content: {
        type: String,
        required: true,
        minlength: 1
    },
    imageUrl: {
        type: String,
        required: false
    },
    hasVideo: {
        type: Boolean,
        required: false
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

module.exports = mongoose.model('Comment', schema)