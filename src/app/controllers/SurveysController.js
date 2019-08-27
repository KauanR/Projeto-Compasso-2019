const Controller = require("./Controller")

module.exports = class SurveysController extends Controller {
    constructor() {
        super("survey", "surveys", "surveys", {
            name: {
                isString: true,
                isLength: {
                    options: {
                        min: 1,
                        max: 255
                    }
                },
                notNull: true,
                errorMessage: "O name deve ser uma string e deve ter entre 1 e 255 caractéres."
            },
            description: {
                isString: true,
                isLength: {
                    options: {
                        min: 1,
                        max: 255
                    }
                },
                errorMessage: "O description deve ser uma string e deve ter entre 1 e 255 caractéres."
            },
            party_type: {
                isString: true,
                isLength: {
                    options: {
                        min: 1,
                        max: 50
                    }
                },
                notNull: true,
                errorMessage: "O party_type deve ser uma string e deve ter entre 1 e 50 caractéres."
            }
        })
    }
}