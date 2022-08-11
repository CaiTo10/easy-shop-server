const express = require("express")
const app = express()
const cors = require('cors')
const morgan = require("morgan")
const bodyParser = require("body-parser")
require("dotenv/config")
require('./database')
const authJwt = require("./helpers/jwt")
const errorHandler = require("./helpers/error-handler")

app.use(cors())
app.options('*',cors())
app.use(authJwt())
app.use(errorHandler)
// Parse JSON bodies for this app. Make sure you put
// `app.use(express.json())` **before** your route handlers!
app.use(express.json());
app.use(morgan('tiny'))
// create application/x-www-form-urlencoded parser
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public/uploads',express.static(__dirname + '/public/uploads'));

const PORT = process.env.PORT || 8181
const server = app.listen(PORT,()=>{
    
})

module.exports = {
    app
}