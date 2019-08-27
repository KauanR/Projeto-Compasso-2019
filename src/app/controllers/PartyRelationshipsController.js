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
                errorMessage: "O campo Type deve ser uma string e deve ter entre 1 e 100 caractéres."
            },
            source_party_id: {
                isInt: {
                    options: {
                        min: 1
                    }
                },
                notNull: true,
                errorMessage: "O campo Source_party_id deve ser inteiro maior que 0."
            },
            target_party_id: {
                isInt: {
                    options: {
                        min: 1
                    }
                },
                notNull: true,
                errorMessage: "O campo Target_party_id deve ser inteiro maior que 0."
            }
        })
    }
}