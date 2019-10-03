const Sequelize = require('sequelize')
const sequelize = require("../config/sequelize")

const Model = Sequelize.Model

class SurveyItems extends Model {}

SurveyItems.init({
    date: {
        type: Sequelize.DATEONLY,
        allowNull: true
    }
}, {
    sequelize,
    tableName: "survey_items"
})

module.exports = SurveyItems