const Controller = require("./Controller")
const _ = require("lodash")

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
        let o = await super.gerarJSON(req, res, location, attrs, obligatory, allObligatory)

        const re = (await this.DAO.get({
            source_party_id: { $eq: o.source_party_id },
            target_party_id: { $eq: o.target_party_id },
            type: { $eq: o.type }
        }))[0]

        if (re !== undefined) {
            res.status(400).json(await this.formatError("[sourcePartyId, targetPartyId, type]", [o.source_party_id, o.target_party_id, o.type], "A combinação de atributos já está cadastrada.", "body"))
            throw new Error("Validation Errors.")
        }

        return o
    }
}