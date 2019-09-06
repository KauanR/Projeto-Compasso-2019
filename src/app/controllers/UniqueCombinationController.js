const Controller = require("./Controller")
const _ = require("lodash")

module.exports = class UniqueCombinationController extends Controller {
    constructor(tabela, validationSchema, naoGerarTodasRotas) {
        super(tabela, validationSchema, naoGerarTodasRotas)
    }

    async gerarJSON(req, res, location, attrs, obligatory, allObligatory, addInfo) {
        let o = await super.gerarJSON(req, res, location, attrs, obligatory, allObligatory, addInfo)

        let query = {}

        const keys = Object.keys(o)
        const keysCC = []
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i]
            keysCC.push(_.camelCase(k))
            query[k] = {
                $eq: o[k]
            }
            query.limit = {
                $count: 1
            }
        }

        const re = (await this.DAO.get(query))[0]

        let a = ""
        if(addInfo !== undefined){
            a = `${addInfo}.`
        }

        if (re !== undefined) {
            res.status(400).json(await this.formatError(keysCC, Object.values(o), "A combinação de atributos com os valores informados já está cadastrada.", `${a}body`))
            throw new Error("Validation Errors.")
        }

        return o
    }
}