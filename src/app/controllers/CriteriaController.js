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
                errorMessage: "O valor de description deve ser uma string e deve ter entre 1 e 500 caractéres."
            },
            kpiId: {
                notNull: true,
                fk: "kpis"
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
            value: {
                isInt: {
                    options: {
                        min: 1
                    }
                },
                notNull: true,
                errorMessage: "O valor de value deve ser um inteiro maior que 0."
            }
        })
    }
}