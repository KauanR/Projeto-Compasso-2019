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
                errorMessage: "O campo Category deve ser uma string e deve ter entre 1 e 100 caractéres."
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
                errorMessage: "O campo Description deve ser uma string e deve ter entre 1 e 255 caractéres."
            },
            details: {
                isString: true,
                isLength: {
                    options: {
                        min: 1,
                        max: 65535
                    }
                },
                errorMessage: "O campo Details deve ser uma string e deve ter entre 1 e 65535 caractéres."
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
                errorMessage: "O campo Name deve ser uma string e deve ter entre 1 e 255 caractéres."
            }
        })
    }
}