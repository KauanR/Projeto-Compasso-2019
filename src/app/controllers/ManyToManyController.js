const Controller = require("./Controller")
const _ = require("lodash")
const DAO = require("../DAO")
module.exports = class KpiSurveyController extends Controller {
    constructor(nomeSingular, nomePlural, tabela, validationSchema, naoGerarTodasRotas) {
        super(nomeSingular, nomePlural, tabela, validationSchema, naoGerarTodasRotas)

        this.DAOsSchema = this.gerarDAOsSchema()
    }

    gerarDAOsSchema() {
        let o = {}
        const fkKeys = Object.keys(this.fkSchema)
        for (let i = 0; i < fkKeys.length; i++) {
            const k = fkKeys[i]
            o[k] = new DAO(this.fkSchema[k])
        }
        return o
    }

    async prepareResponseJSON(json, except) {
        const o = JSON.parse(JSON.stringify(json))

        const keys = Object.keys(o)
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i]
            const cck = _.camelCase(k)
            if (except === undefined || !except.includes(cck)) {
                const buff = o[k]
                delete o[k]
                if (this.DAOsSchema[cck] !== undefined) {
                    let query = {
                        id: {
                            $eq: buff
                        }
                    }

                    const dbO = (await this.DAOsSchema[cck].get(query))[0]

                    const name = cck.slice(0, -2)
                    o[name] = await this.prepareResponseJSON(dbO)

                } else {
                    o[cck] = buff
                }
            } else {
                delete o[k]
            }
        }

        return o
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