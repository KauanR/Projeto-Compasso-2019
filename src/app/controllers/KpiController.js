const Controller = require("./Controller")

module.exports = class KpiController extends Controller {
    constructor() {
        super("kpi", "kpis", "kpis", {
            category: {
                isString: true,
                isLength: {
                    options: {
                        min: 1,
                        max: 100
                    }
                },
                notNull: true,
                errorMessage: "O campo category deve ser uma string e deve ter entre 1 e 100 caractéres."
            },
            description: {
                isString: true,
                isLength: {
                    options: {
                        min: 1,
                        max: 255
                    }
                },
                notNull: true,
                errorMessage: "O campo description deve ser uma string e deve ter entre 1 e 255 caractéres."
            },
            details: {
                isString: true,
                isLength: {
                    options: {
                        min: 1,
                        max: 65535
                    }
                },
                errorMessage: "O campo details deve ser uma string e deve ter entre 1 e 65535 caractéres."
            },
            name: {
                isString: true,
                isLength: {
                    options: {
                        min: 1,
                        max: 255
                    }
                },
                notNull: true,
                errorMessage: "O campo name deve ser uma string e deve ter entre 1 e 255 caractéres."
            }
        })
    }
}