const Sequelize = require('sequelize')
const sequelize = require("../config/sequelize")

const Model = Sequelize.Model

class KpiSurvey extends Model {}

KpiSurvey.init({
    group: {
        type: Sequelize.STRING(500),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    }
}, {
    sequelize,
    tableName: "kpi_survey"
})

module.exports = KpiSurvey