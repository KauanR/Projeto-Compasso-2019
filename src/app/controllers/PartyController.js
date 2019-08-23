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
                escape: true,
                errorMessage: "O valor deve ser uma string e deve ter entre 1 e 255 caractéres."
            },
            type: {
                isString: true,
                isLength: {
                    options: {
                        min: 1,
                        max: 100
                    }
                },
                escape: true,
                errorMessage: "O valor deve ser uma string e deve ter entre 1 e 100 caractéres."
            },
            last_assessment: {
                isISO8601: true,
                errorMessage: "O valor deve ser uma data no formato ISO8601."
            },
            observations: {
                isString: true,
                escape: true,
                errorMessage: "O valor deve ser uma string."
            }
        })
    }
}