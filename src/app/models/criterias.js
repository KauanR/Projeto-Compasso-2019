const Sequelize = require('sequelize')
const sequelize = require("../config/sequelize")

const SurveyItems = require("./survey_items")

const Model = Sequelize.Model

class Criterias extends Model {}

Criterias.init({
    type: {
        type: Sequelize.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    value: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    description: {
        type: Sequelize.STRING(500),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    }
}, {
    sequelize,
    tableName: "criterias"
})

Criterias.hasOne(SurveyItems)

module.exports = Criterias