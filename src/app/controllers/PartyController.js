const Controller = require("./Controller")

module.exports = class PartyController extends Controller {
    constructor() {
        super("party", "parties", "PARTY", {
            name: {
                isString: true,
                isLength: {
                    options: {
                        min: 1,
                        max: 255
                    }
                },
                exists: true,
                escape: true,
                errorMessage: "O valor deve ser uma string e deve ter entre 1 e 255 caractéres."
            },
            type: {
                isString: true,
                isLength: {
                    min: 1,
                    max: 100
                },
                exists: true,
                escape: true,
                errorMessage: "O valor deve ser uma string e deve ter entre 1 e 100 caractéres."
            },
            last_assessment: {
                isISO8601: true,
                exists: true,
                errorMessage: "O valor deve ser uma data no formato ISO8601."
            },
            observations: {
                isString: true,
                exists: true,
                escape: true,
                errorMessage: "O valor deve ser uma string."
            }
        }, false)
    }
}