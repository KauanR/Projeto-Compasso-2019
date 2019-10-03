const request = require('supertest')
const app = require('../src/config/custom-express')
const Controller = require('../config/controller')

const controller = new Controller(app, request)
controller.getAll('kpis')
