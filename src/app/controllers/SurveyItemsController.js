const Controller = require("./Controller")

module.exports = class SurveyItemsController extends Controller {
    constructor() {
        super("survey-item", "survey-items", "survey_items", {
            date: {
                isISO8601: true,
                notNull: true,
                errorMessage: "O date deve ser uma data no formato ISO8601 (AAAA-MM-DD)."
            },
            party_id: {
                isInt: {
                    options: {
                        min: 1
                    }
                },
                notNull: true,
                errorMessage: "O party_id deve ser inteiro maior que 0."
            },
            criteria_id: {
                isInt: {
                    options: {
                        min: 1
                    }
                },
                notNull: true,
                errorMessage: "O criteria_id deve ser inteiro maior que 0."
            },
            criteria_kpi_id: {
                isInt: {
                    options: {
                        min: 1
                    }
                },
                notNull: true,
                errorMessage: "O criteria_kpi_id deve ser inteiro maior que 0."
            }
        })
    }
}