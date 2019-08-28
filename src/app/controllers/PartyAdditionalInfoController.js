const Controller = require("./Controller")

module.exports = class PartyAdditionalInfoController extends Controller {
    constructor() {
        super("party-additional-info", "party-additional-infos", "party_additional_info", {
            info: {
                isString: true,
                isLength: {
                    options: {
                        min: 1,
                        max: 255
                    }
                },
                notNull: true,
                errorMessage: "O valor de info deve ser uma string e deve ter entre 1 e 255 caractéres."
            },
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
            party_id: {
                notNull: true,
                fk: "parties"
            }
        })
    }
}