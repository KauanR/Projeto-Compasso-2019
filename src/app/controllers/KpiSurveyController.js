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
                errorMessage: "O campo group deve ser uma string e deve ter entre 1 e 500 caractéres."
            },
            survey_id: {
                isInt: {
                    options: {
                        min: 1
                    }
                },
                notNull: true,
                errorMessage: "O campo survey_id deve ser inteiro maior que 0."
            },
            kpi_id: {
                isInt: {
                    options: {
                        min: 1
                    }
                },
                notNull: true,
                errorMessage: "O campo kpi_id deve ser inteiro maior que 0."
            }
        })
    }
}