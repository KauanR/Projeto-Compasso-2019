const express = require('express')
const bodyParser = require('body-parser')
const expressRequestId = require('express-request-id')

// BODY PARSER - receber JSON
const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(expressRequestId())

app.use((new(require("../app/controllers/PartyController"))).router)

module.exports = app