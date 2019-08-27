const Controller = require("./Controller")

module.exports = class KpiSurveyController extends Controller {
    constructor() {
        super("kpi-survey", "kpi-surveys", "kpi_survey", {
            group: {
                isString: true,
                isLength: {
                    options: {
                        min: 1,
                        max: 500
                    }
                },
                notNull: true,
                errorMessage: "O valor de group deve ser uma string e deve ter entre 1 e 500 caractéres."
            },
            survey_id: {
                isInt: {
                    options: {
                        min: 1
                    }
                },
                notNull: true,
                errorMessage: "O valor de survey_id deve ser inteiro maior que 0."
            },
            kpi_id: {
                isInt: {
                    options: {
                        min: 1
                    }
                },
                notNull: true,
                errorMessage: "O valor de kpi_id deve ser inteiro maior que 0."
            }
        })
    }
}