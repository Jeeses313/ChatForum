const express = require('express')
const { MONGODB_URI } = require('./utils/config')
const app = express()
const cors = require('cors')
app.use(cors())
app.use(express.static('build'))
const { NODE_ENV } = require('./utils/config')
if (NODE_ENV !== "development") {
    app.get('*', (req, res) => {
        res.sendFile(`${__dirname}/build/index.html`, (err) => {
            if (err) {
                res.status(500).send(err)
            }
        })
    })
}
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