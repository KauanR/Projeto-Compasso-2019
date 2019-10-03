const Sequelize = require('sequelize')
const sequelize = require("../config/sequelize")

const Criterias = require("./criterias")
const Surveys = require("./surveys")
const KpiSurvey = require("./kpi_survey")

module.exports = (sequelize, DataTypes) => {
    class Project extends sequelize.Model { }
    Project.init({
      name: DataTypes.STRING,
      description: DataTypes.TEXT
    }, { sequelize });
    return Project;
  }

const Model = Sequelize.Model

class Kpis extends Model {}

Kpis.init({
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            isAlphanumeric: true,
            notEmpty: true       
        }
    },
    description: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            isAlphanumeric: true,
            notEmpty: true       
        }
    },
    category: {
        type: Sequelize.STRING(100),
        allowNull: false,
        validate: {
            isAlphanumeric: true,
            notEmpty: true       
        }
    },
    details: {
        type: Sequelize.TEXT,
        allowNull: true,
        validate: {
            isAlphanumeric: true,
            notEmpty: true       
        }
    }
}, {
    sequelize,
    tableName: "kpis"
})

Kpis.belongsToMany(Survey, {
    through: {
        model: KpiSurvey,
        unique: true
    }
})

Kpis.hasMany(Criterias)

module.exports = Kpis