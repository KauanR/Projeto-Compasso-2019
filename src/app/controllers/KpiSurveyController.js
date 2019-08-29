const Controller = require("./Controller")

const _ = require("lodash")

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

    
    async gerarJSON(req, res, location, attrs, obligatory, allObligatory) {
        let o = await super.gerarJSON(req, res, location, attrs, obligatory, allObligatory)

        const re = (await this.DAO.get({
            survey_id: { $eq: o.survey_id },
            kpi_id: { $eq: o.kpi_id },
            grupo: { $eq: o.grupo }
        }))[0]

        if(re !== undefined){
            res.status(400).json(await this.formatError("[surveyId, kpiId, grupo]", [o.survey_id, o.kpi_id, o.grupo], "A combinação de atributos já está cadastrada.", "body"))
            throw new Error("Validation Errors.")
        }

        return o
    }
}