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
                fk: "party"
            },
            criteriaId: {
                notNull: true,
                fk: "criteria"
            },
            criteriaKpiId: {
                notNull: true,
                fk: "kpis"
            }
        })

        this.criteriaController = new CriteriaController()
    }

    async adicionaUm(req, res) {
        try {
            await this.inicio(req, res, `adicionando ${this.nomeSingular}...`)

            let resultado = undefined

            let reqCopy = {}
            Object.assign(reqCopy, req)

            reqCopy.body.date = new Date()

            if (reqCopy.body.criterias !== undefined && reqCopy.body.criterias instanceof Array) {
                resultado = []

                const criterias = reqCopy.body.criterias
                delete reqCopy.body.criterias

                for (let i = 0; i < criterias.length; i++) {
                    const criteria = (await this.criteriaController.gerarBusca({
                        query: {
                            id: {
                                $eq: criterias[i].id
                            },
                            except: "description,type,value"
                        }
                    }, res))[0]

                    reqCopy.body.criteriaId = criteria.id
                    reqCopy.body.criteriaKpiId = criteria.kpi.id

                    resultado.push(await this.gerarAdicao(reqCopy, res, `criterias[${i}]`))
                }

                res.status(201).json({results: resultado})
            }
            else {
                resultado = await this.gerarAdicao(reqCopy, res)
                res.status(201).json(resultado)
            }

            this.fim(reqCopy, res)
        } catch (error) {
            this.errorHandler(error, req, res)
        }
    }

}