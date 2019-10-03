const Sequelize = require('sequelize')
const sequelize = require("../config/sequelize")

const Model = Sequelize.Model

class PartyRelationships extends Model {}

PartyRelationships.init({
    type: {
        type: Sequelize.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    }
}, {
    sequelize,
    tableName: "party_relationships"
})

module.exports = PartyRelationships