const Controller = require("./Controller")

const KpiSurveyController = require("./KpiSurveyController")
const CriteriaController = require("./CriteriaController")
const KpiController = require("./KpiController")

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
            partyType: {
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
        }, false)

        this.kpiSurvey = new KpiSurveyController()
        this.kpi = new KpiController()
        this.criteria = new CriteriaController()

        this.validationSchema.except.custom = {
            options: value => {
                const arr = ["surveyId", "kpi_id"].concat(this.attrs)
                const arrV = value.split(",")
                let b = true
                for (let i = 0; i < arrV.length; i++) {
                    if (!arr.includes(arrV[i])) {
                        b = false
                        break
                    }
                }
                return b
            }
        }

        this.gerarBusca = this.gerarBusca.bind(this)

        this.router.get(`/${this.nomePlural}`, checkSchema(this.validationSchema), (req, res) => this.buscaTodosDados(req, res))
        this.router.delete(`/${this.nomePlural}`, checkSchema(this.validationSchema), (req, res) => this.deleta(req, res))
        this.router.post(`/${this.nomePlural}`, checkSchema(this.validationSchema), (req, res) => this.atualiza(req, res))
        this.router.post(`/${this.nomePlural}/${this.nomeSingular}`, checkSchema(this.validationSchema), (req, res) => this.adicionaUm(req, res))


    }



    async gerarBusca(req, res) {

        const query = await this.gerarQuery(req, res)

        let resultado = await this.DAO.get(query)
        for (let i = 0; i < resultado.length; i++) {
            resultado[i] = await this.prepareResponseJSON(resultado[i])

            const ks = await this.kpiSurvey.gerarBusca({
                query: {
                    survey_id: {
                        $eq: resultado[i].id
                    }
                }
            })

            resultado[i].kpis = []
            for (let j = 0; j < ks.length; j++) {
                let r = (await this.kpi.gerarBusca({
                    query: {
                        id: {
                            $eq: ks[j].kpi_id
                        }
                    }
                }))[0]
                r.criterias = await this.criteria.gerarBusca({
                    query: {
                        kpi_id: {
                            $eq: r.id
                        }
                    }
                })

                resultado[i].kpis.push(r)
            }

        }

       return resultado
       
    }

    

}