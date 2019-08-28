const Controller = require("./Controller")

const DAO = require("../DAO")

const {
    checkSchema
} = require('express-validator')

module.exports = class SurveysController extends Controller {
    constructor() {
        super("survey", "surveys", "surveys", {
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
            },
            description: {
                isString: true,
                isLength: {
                    options: {
                        min: 1,
                        max: 255
                    }
                },
                errorMessage: "O valor de description deve ser uma string e deve ter entre 1 e 255 caractéres."
            },
            party_type: {
                isString: true,
                isLength: {
                    options: {
                        min: 1,
                        max: 50
                    }
                },
                notNull: true,
                errorMessage: "O valor de party_type deve ser uma string e deve ter entre 1 e 50 caractéres."
            }
        })

        this.router.get(`/${this.nomePlural}`, checkSchema(this.validationSchema), (req, res) => this.buscaTodosDados(req, res))
    }

    async buscaTodosDados(req, res) {
        try {
            await this.inicio(req, res, `buscando ${this.nomePlural} todos os dados...`)

            const query = await this.gerarQuery(req, res)

            const kpiSurveyDAO = new DAO("kpi_survey")
            const kpisDAO = new DAO("kpis")
            const criteriasDAO = new DAO("criteria")

            let resultado = await this.DAO.get(query)
            for (let i = 0; i < resultado.length; i++) {
                resultado[i] = await this.converterFkEmLink(resultado[i])

                const ks = await kpiSurveyDAO.get({
                    survey_id: { $eq: resultado[i].id }
                })

                resultado[i].kpis = []
                for (let j = 0; j < ks.length; j++) {
                    let r = (await kpisDAO.get({
                        id: { $eq: ks[j].kpi_id }
                    }))[0]
                    r.criterias = await criteriasDAO.get({
                        kpi_id: { $eq: r.id }
                    })

                    resultado[i].kpis.push(r)
                }

            }

            res.status(200).json(resultado)

            this.fim(req, res)
        } catch (error) {
            this.errorHandler(error, req, res)
        }
    }

}