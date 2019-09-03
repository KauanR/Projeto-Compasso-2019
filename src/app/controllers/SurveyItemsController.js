const Controller = require("./Controller")
const CriteriaController = require("./CriteriaController")

module.exports = class SurveyItemsController extends Controller {
    constructor() {
        super("survey_items", {
            date: {
                isISO8601: true,
                notNull: true,
                errorMessage: "O date deve ser uma data no formato ISO8601 (AAAA-MM-DD)."
            },
            partyId: {
                notNull: true,
                fk: "parties/party"
            },
            criteriaId: {
                notNull: true,
                fk: "criterias/criteria"
            },
            criteriaKpiId: {
                notNull: true,
                fk: "kpis/kpi"
            }
        })

        this.criteriaController = new CriteriaController()
    }

    async adicionaUm(req, res) {
        try {
            await this.inicio(req, res, `adicionando ${this.nomeSingular}...`)

            let resultado = undefined

            req.body.date = new Date()

            if (req.body.criterias !== undefined && req.body.criterias instanceof Array) {
                resultado = []

                const criterias = req.body.criterias
                delete req.body.criterias

                for (let i = 0; i < criterias.length; i++) {
                    const criteria = (await this.criteriaController.gerarBusca({
                        query: {
                            id: {
                                $eq: criterias[i].id
                            },
                            except: "description,type,value"
                        }
                    }, res))[0]

                    req.body.criteriaId = criteria.id
                    req.body.criteriaKpiId = criteria.kpi.id

                    resultado.push(await this.gerarAdicao(req, res))
                }

                res.status(201).json({results: resultado})
            }
            else {
                resultado = await this.gerarAdicao(req, res)
                res.status(201).json(resultado)
            }

            this.fim(req, res)
        } catch (error) {
            this.errorHandler(error, req, res)
        }
    }

}