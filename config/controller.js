module.exports = class Controller {

    constructor(app, request){
        this._app = app
        this._request = request
    }

    getAll(table){
        describe('GET '+table, () => {
            it('Buscando '+table, async () => {
                const res = await this._request(this._app)
                .get('/'+table)
                expect(res.statusCode).toEqual(200)
            })
        })
    }
}