const Sequelize = require('sequelize')
const sequelize = require("../config/sequelize")

const Kpis = require("./kpis")
const KpiSurvey = require("./kpi_survey")

const Model = Sequelize.Model

class Surveys extends Model { }

Surveys.init({
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    description: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
            notEmpty: true
        }
    },
    party_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    }
}, {
        sequelize,
        tableName: "surveys"
    })

Survey.belongsToMany(Kpis, {
    through: {
        model: KpiSurvey,
        unique: true
    }
})

module.exports = Surveys