const ManyToManyController = require("./ManyToManyController")

module.exports = class KpiSurveyController extends ManyToManyController {
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
            surveyId: {
                notNull: true,
                fk: "surveys"
            },
            kpiId: {
                notNull: true,
                fk: "kpis"
            }
        })
    }
}