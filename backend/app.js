const express = require('express')
const { MONGODB_URI } = require('./utils/config')
const app = express()
const mongoose = require('mongoose')
mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('connected to MongoDB')
    })
    .catch((error) => {
        console.log('error connection to MongoDB:', error.message)
    })
module.exports = app