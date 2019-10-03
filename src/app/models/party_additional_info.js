const Sequelize = require('sequelize')
const sequelize = require("../config/sequelize")

const Model = Sequelize.Model

class PartyAdditionalInfo extends Model {}

PartyAdditionalInfo.init({
    info: {
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
    }
}, {
    sequelize,
    tableName: "party_additional_info"
})

module.exports = PartyAdditionalInfo