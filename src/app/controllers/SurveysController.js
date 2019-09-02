const OneToManyController = require("./OneToManyController")
const KpiSurveyController = require("./KpiSurveyController")
const KpiController = require("./KpiController")

module.exports = class SurveysController extends OneToManyController {
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
        }, false, {
            kpisSurveys: {
                controller: new KpiSurveyController(),
                fkToThis: "surveyId"
            }
        })

        this.kpiController = new KpiController()

    }

    async gerarBusca(req, res) {
        let resultado = await super.gerarBusca(req, res)

        for (let i = 0; i < resultado.length; i++) {

            for (let j = 0; j < resultado[i].kpisSurveys.length; j++) {
                resultado[i].kpisSurveys[j].kpi = await this.kpiController.gerarBusca({
                    query: {
                        id: {
                            $eq: resultado[i].kpisSurveys[j].kpi.id
                        },
                        except: "kpisSurveys"
                    }
                }, res)
            }

        }

        return resultado
    }


}