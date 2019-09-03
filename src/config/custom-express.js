const express = require('express')
const bodyParser = require('body-parser')
const expressRequestId = require('express-request-id')

// BODY PARSER - receber JSON
const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(expressRequestId())

// const PartyController = require("../app/controllers/PartyController")
// const partyController = new PartyController()
// app.use(partyController.router)

// const PartyAdditionalInfoController = require("../app/controllers/PartyAdditionalInfoController")
// const partyAdditionalInfoController = new PartyAdditionalInfoController()
// app.use(partyAdditionalInfoController.router)

// const PartyRelationshipsController = require("../app/controllers/PartyRelationshipsController")
// const partyRelationshipsController = new PartyRelationshipsController()
// app.use(partyRelationshipsController.router)

const KpiController = require("../app/controllers/KpiController")
const kpiController = new KpiController()
app.use(kpiController.router)

// const CriteriaController = require("../app/controllers/CriteriaController")
// const criteriaController = new CriteriaController()
// app.use(criteriaController.router)

// const SurveysController = require("../app/controllers/SurveysController")
// const surveysController = new SurveysController()
// app.use(surveysController.router)

// const KpiSurveyController = require("../app/controllers/KpiSurveyController")
// const kpiSurveyController = new KpiSurveyController()
// app.use(kpiSurveyController.router)

// const SurveyItemsController = require("../app/controllers/SurveyItemsController")
// const surveyItemsController = new SurveyItemsController()
// app.use(surveyItemsController.router)

const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('../swagger/swagger.json')
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))


module.exports = app