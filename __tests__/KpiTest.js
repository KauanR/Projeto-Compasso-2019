const request = require('supertest')
const app = require('../src/config/custom-express')
const Tests = require('./Tests')


describe('GET kpi', () => {
  it('Buscando as kpis', async () => {
    const res = await request(app)
    .get('/kpis')
    expect(res.statusCode).toEqual(200)
  })
})
