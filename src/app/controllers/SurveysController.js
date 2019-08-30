const OneToManyController = require("./OneToManyController")

const KpiSurveyController = require("./KpiSurveyController")

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
            kpiSurveys: {
                controller: new KpiSurveyController(),
                fkToThis: "surveyId"
            }
        })
    }

}