const Sequelize = require('sequelize')
const sequelize = require("../config/sequelize")

const Model = Sequelize.Model

class SurveyHistory extends Model {}

SurveyHistory.init({
    initialDate: {
        type: Sequelize.DATEONLY,
        allowNull: true
    },
    finalDate: {
        type: Sequelize.DATEONLY,
        allowNull: true
    }
}, {
    sequelize,
    tableName: "survey_history"
})

module.exports = SurveyHistory