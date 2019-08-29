const Controller = require("./Controller")

module.exports = class PartyRelationships extends Controller {
    constructor() {
        super("party-relationship", "party-relationships", "party_relationships", {
            type: {
                isString: true,
                isLength: {
                    options: {
                        min: 1,
                        max: 100
                    }
                },
                notNull: true,
                errorMessage: "O valor de type deve ser uma string e deve ter entre 1 e 100 caractéres."
            },
            sourcePartyId: {
                notNull: true,
                fk: "parties"
            },
            targetPartyId: {
                notNull: true,
                fk: "parties"
            }
        })
    }


    async gerarJSON(req, res, location, attrs, obligatory, allObligatory) {
        let o = {}

        let errors = []

        const re = (await this.DAO.get({
            source_party_id: { $eq: req.body.sourcePartyId },
            target_party_id: { $eq: req.body.targetPartyId }
        }))[0]

        if (re !== undefined) {
            res.status(400).json(await this.formatError("[sourcePartyId, targetPartyId]", [req.body.sourcePartyId, req.body.targetPartyId], "Não é possivel cadastrar diferentes kpis-surveys para mesma kpi"))
            throw new Error("Validation Errors.")
        }

        for (let i = 0; i < attrs.length; i++) {
            const attr = attrs[i]
            const value = req[location][attr]

            if (value === undefined && allObligatory) {
                errors.push(await this.formatError(attr, value, "O valor deve ser informado.", location))
            } else if (value === null && obligatory && obligatory.includes(attr)) {
                errors.push(await this.formatError(attr, value, "O valor não pode ser nulo.", location))
            } else if (value !== undefined) {
                o[_.snakeCase(attr)] = value
            }
        }

        if (Object.keys(o).length === 0) {
            res.status(400).json(await this.formatError(undefined, undefined, `O request ${location} está vazio ou não possue algum atributo válido.`))

            throw new Error("Empty object.")
        }

        if (errors.length > 0) {
            res.status(400).json(errors)

            throw new Error("Not Null error.")
        }

        return o
    }
}