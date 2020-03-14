require('dotenv').config()
const PORT = process.env.PORT
const MONGODB_URI = process.env.MONGODB_URI
const NODE_ENV = process.env.NODE_ENV
const SECRET = process.env.SECRET

module.exports = {
    MONGODB_URI,
    PORT,
    MONGODB_URI,
    NODE_ENV,
    SECRET
}
