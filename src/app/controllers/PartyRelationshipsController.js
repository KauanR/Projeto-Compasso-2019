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
}