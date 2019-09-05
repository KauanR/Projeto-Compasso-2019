const request = require('supertest')
const app = require('../src/config/custom-express')
const Controller = require('../config/controller')

const controller = new Controller(app, request)
controller.getAll('criteria')


describe('POST criteria', () => {
  it('Postando uma criteria', async () => {
    const res = await request(app)
    .post('/criteria')
    .send({
      type: "teste",
      value: 1,
      description: "teste",
      kpiId: 1
    })
    expect(res.statusCode).toEqual(201)
  })
})
