const request = require('supertest')
const app = require('../src/config/custom-express')

describe('GET criterias', () => {
  it('Buscando as criterias', async () => {
    const res = await request(app)
    .get('/criteria')
    expect(res.statusCode).toEqual(200)
  })
})