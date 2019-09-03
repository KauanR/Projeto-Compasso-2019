const UniqueCombinationController = require("./UniqueCombinationController")

module.exports = class KpiSurveyController extends UniqueCombinationController {
    constructor() {
        super("kpis_survey", {
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
            surveyId: {
                notNull: true,
                fk: "surveys/survey"
            },
            kpiId: {
                notNull: true,
                fk: "kpis/kpi"
            }
        })
    }
}