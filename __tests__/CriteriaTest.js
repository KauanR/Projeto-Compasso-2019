const request = require('supertest')
const app = require('../src/config/custom-express')

describe('GET criterias', () => {
  it('Buscando as criterias', async () => {
    const res = await request(app)
    .get('/criteria')
    expect(res.statusCode).toEqual(200)
  })
})

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