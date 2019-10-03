const Sequelize = require('sequelize')
const sequelize = require("../config/sequelize")

const PartyAdditionalInfo = require("./party_additional_info")
const PartyRelatioships = require("./party_relationships")
const SurveyItems = require("./survey_items")

const Model = Sequelize.Model

class Party extends Model {}

Party.init({
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            isAlphanumeric: true,
            notEmpty: true       
        }
    },
    type: {
        type: Sequelize.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    lastAssessment: {
        type: Sequelize.DATEONLY,
        allowNull: true
    },
    observations: {
        type: Sequelize.TEXT,
        allowNull: true,
        validate: {
            notEmpty: true
        }
    }
}, {
    sequelize,
    tableName: "party"
})

Party.hasMany(PartyAdditionalInfo)

Party.hasOne(PartyRelatioships, {foreignKey: "source_party_id"})
Party.hasOne(PartyRelatioships, {foreignKey: "target_party_id"})

Party.hasOne(SurveyItems)

module.exports = Party

