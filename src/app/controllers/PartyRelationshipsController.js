const ManyToManyController = require("./ManyToManyController")

module.exports = class PartyRelationships extends ManyToManyController {
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
                fk: "party"
            },
            targetPartyId: {
                notNull: true,
                fk: "party"
            }
        })
    }
}