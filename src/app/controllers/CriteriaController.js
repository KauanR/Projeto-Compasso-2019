const Controller = require("./Controller")

module.exports = class CriteriaController extends Controller {
    constructor() {
        super("criteria", "criterias", "criteria", {
            description: {
                isString: true,
                isLength: {
                    options: {
                        min: 1,
                        max: 500
                    }
                },
                notNull: true,
                errorMessage: "O campo description deve ser uma string e deve ter entre 1 e 500 caractéres."
            },
            kpi_id: {
                isInt: true,
                isLength: {
                    options: {
                        min: 1,
                        max: 11
                    }
                },
                notNull: true,
                errorMessage: "O campo kpi_id deve ser inteiro maior que 0 caracteres e menor que 11 caracteres."
            },
            type: {
                isString: true,
                isLength: {
                    options: {
                        min: 1,
                        max: 111
                    }
                },
                notNull: true,
                errorMessage: "O campo type deve ser uma string e deve ter entre 1 e 100 caractéres."
            },
            value: {
                isInt: true,
                isLength: {
                    options: {
                        min: 1,
                        max: 11
                    }
                },
                notNull: true,
                errorMessage: "O campo value deve ser uma string e deve ter entre 1 e 11 caractéres."
            }
        })
    }
}