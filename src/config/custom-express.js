const express = require('express')
const bodyParser = require('body-parser')
const expressRequestId = require('express-request-id')

// BODY PARSER - receber JSON
const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(expressRequestId())

const PartyController = require("../app/controllers/PartyController")
const partyController = new PartyController()
app.use(partyController.router)

module.exports = app