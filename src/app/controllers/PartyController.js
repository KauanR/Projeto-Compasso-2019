const Controller = require("./Controller")

module.exports = class PartyController extends Controller {
    constructor() {
        super("party", "parties", "party", {
            name: {
                isString: true,
                isLength: {
                    options: {
                        min: 1,
                        max: 255
                    }
                },
                notNull: true,
                errorMessage: "O campo Name deve ser uma string e deve ter entre 1 e 255 caractéres."
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
                errorMessage: "O campo Type deve ser uma string e deve ter entre 1 e 100 caractéres."
            },
            last_assessment: {
                isISO8601: true,
                notNull: true,
                errorMessage: "O campo Last_assessment deve ser uma data no formato ISO8601."
            },
            observations: {
                isString: true,
                notNull: true,
                errorMessage: "O campo Observations deve ser uma string."
            }
        })
    }
}