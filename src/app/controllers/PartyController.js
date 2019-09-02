const OneToManyController = require("./OneToManyController")
const PartyRelationshipsController = require("./PartyRelationshipsController")
const PartyAdditionalInfoController = require("./PartyAdditionalInfoController")

module.exports = class PartyController extends OneToManyController {
    constructor() {
        super("party", "parties", "party", {
            name: {
                isString: true,
                isLength: {
                    options: {
                        min: 1,
                        max: 255
                    }
                },
                notNull: true,
                errorMessage: "O valor de name deve ser uma string e deve ter entre 1 e 255 caractéres."
            },
            type: {
                isString: true,
                isLength: {
                    options: {
                        min: 1,
                        max: 100
                    }
                },
                notNull: true,
                errorMessage: "O valor de type deve ser uma string e deve ter entre 1 e 100 caractéres."
            },
            lastAssessment: {
                isISO8601: true,
                notNull: true,
                errorMessage: "O valor de last_assessment deve ser uma data no formato ISO8601."
            },
            observations: {
                isString: true,
                notNull: true,
                errorMessage: "O valor de observations deve ser uma string."
            }
        }, false, {
            additionalInfos: {
                controller: new PartyAdditionalInfoController(),
                fkToThis: "partyId"
            },
            relationships: {
                controller: new PartyRelationshipsController(),
                fkToThis: "sourcePartyId"
            }
        })
    }

    async gerarBusca(req, res) {
        let resultado = await super.gerarBusca(req, res)

        for (let i = 0; i < resultado.length; i++) {

            for (let j = 0; j < resultado[i].relationships.length; j++) {
                resultado[i].relationships[j].targetParty = (await super.gerarBusca({
                    query: {
                        id: {
                            $eq: resultado[i].relationships[j].targetParty.id
                        },
                        except: "relationships, additionalInfos"
                    }
                }, res))[0]
            }

        }

        return resultado
    }

}