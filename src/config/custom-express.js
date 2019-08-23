const express = require('express')
const bodyParser = require('body-parser')

// BODY PARSER - receber JSON
const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use((new(require("../app/controllers/PartyController"))).router)

module.exports = app