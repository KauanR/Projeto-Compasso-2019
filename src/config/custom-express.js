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

const PartyAdditionalInfoController = require("../app/controllers/PartyAdditionalInfoController")
const partyAdditionalInfoController = new PartyAdditionalInfoController()
app.use(partyAdditionalInfoController.router)

const PartyRelationshipsController = require("../app/controllers/PartyRelationshipsController")
const partyRelationshipsController = new PartyRelationshipsController()
app.use(partyRelationshipsController.router)

const SurveysController = require("../app/controllers/SurveysController")
const surveysController = new SurveysController()
app.use(surveysController.router)

const KpiSurveyController = require("../app/controllers/KpiSurveyController")
const kpiSurveyController = new KpiSurveyController()
app.use(kpiSurveyController.router)

module.exports = app