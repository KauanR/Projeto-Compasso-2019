const Controller = require("./Controller")

module.exports = class KpiSurveyController extends Controller {
    constructor() {
        super("kpi-survey", "kpi-surveys", "kpi_survey", {
            grupo: {
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
                notNull: true,
                fk: "surveys"
            },
            kpi_id: {
                notNull: true,
                fk: "kpis"
            }
        })
    }

}