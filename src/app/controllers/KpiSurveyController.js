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
        let o = {}

        let errors = []

        const re = this.DAO.get({
            survey_id: req.body.surveyId,
            kpi_id: req.body.kpiId
        })

        if(re !== undefined){
            res.status(400).json(await this.formatError("[surveyId, kpiId]", [req.body.surveyId, req.body.kpiId], "Não é possivel cadastrar diferentes kpis-surveys para mesma kpi"))
            throw new Error("Validation Errors.")
        }

        for (let i = 0; i < attrs.length; i++) {
            const attr = attrs[i]
            const value = req[location][attr]

            if (value === undefined && allObligatory) {
                errors.push(await this.formatError(attr, value, "O valor deve ser informado.", location))
            } else if (value === null && obligatory && obligatory.includes(attr)) {
                errors.push(await this.formatError(attr, value, "O valor não pode ser nulo.", location))
            } else if (value !== undefined) {
                o[_.snakeCase(attr)] = value
            }
        }

        if (Object.keys(o).length === 0) {
            res.status(400).json(await this.formatError(undefined, undefined, `O request ${location} está vazio ou não possue algum atributo válido.`))

            throw new Error("Empty object.")
        }

        if (errors.length > 0) {
            res.status(400).json(errors)

            throw new Error("Not Null error.")
        }

        return o
    }
}