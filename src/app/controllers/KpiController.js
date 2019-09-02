const OneToManyController = require("./OneToManyController")
const KpiSurveyController = require("./KpiSurveyController")
const CriteriaController = require("./CriteriaController")

module.exports = class KpiController extends OneToManyController {
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
                errorMessage: "O valor de category deve ser uma string e deve ter entre 1 e 100 caractéres."
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
                errorMessage: "O valor de description deve ser uma string e deve ter entre 1 e 255 caractéres."
            },
            details: {
                isString: true,
                isLength: {
                    options: {
                        min: 1,
                        max: 65535
                    }
                },
                errorMessage: "O valor de details deve ser uma string e deve ter entre 1 e 65535 caractéres."
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
                errorMessage: "O valor de name deve ser uma string e deve ter entre 1 e 255 caractéres."
            }
        }, false, {
            KpisSurveys: {
                controller: new KpiSurveyController(),
                fkToThis: "kpiId"
            },
            criterias:{
                controller: new CriteriaController(),
                fkToThis: "kpiId"
            }
        })

    }
    
}