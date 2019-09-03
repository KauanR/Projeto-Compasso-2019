const Controller = require("./Controller")

module.exports = class UniqueCombinationController extends Controller {
    constructor(tabela, validationSchema, naoGerarTodasRotas) {
        super(tabela, validationSchema, naoGerarTodasRotas)
    }

    async gerarJSON(req, res, location, attrs, obligatory, allObligatory) {
        let o = await super.gerarJSON(req, res, location, attrs, obligatory, allObligatory)

        let query = {}

        const keys = Object.keys(o)
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i]
            query[k] = {
                $eq: o[k]
            }
        }

        const re = (await this.DAO.get(query))[0]

        if (re !== undefined) {
            res.status(400).json(await this.formatError(JSON.stringify(keys), Object.values(o), "A combinação de atributos com os valores informados já está cadastrada.", "body"))
            throw new Error("Validation Errors.")
        }

        return o
    }
}