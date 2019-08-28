const Controller = require("./Controller")
const PartyRelationshipsController = require("./PartyRelationshipsController")
const PartyAdditionalInfoController = require("./PartyAdditionalInfoController")

const {
    checkSchema
} = require('express-validator')

module.exports = class PartyController extends Controller {
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
        }, true)

        this.partyAdditionalInfoController = new PartyAdditionalInfoController()
        this.partyRelationshipsController = new PartyRelationshipsController()

        this.validationSchema.except.custom = {
            options: value => {
                const arr = ["additionalInfos", "relationships"].concat(this.attrs)
                const arrV = value.split(",")
                let b = true
                for (let i = 0; i < arrV.length; i++) {
                    if (!arr.includes(arrV[i])) {
                        b = false
                        break
                    }
                }
                return b
            }
        }

        this.gerarBusca = this.gerarBusca.bind(this)

        this.router.get(`/${this.nomePlural}`, checkSchema(this.validationSchema), (req, res) => this.busca(req, res))
        this.router.delete(`/${this.nomePlural}`, checkSchema(this.validationSchema), (req, res) => this.deleta(req, res))
        this.router.post(`/${this.nomePlural}`, checkSchema(this.validationSchema), (req, res) => this.atualiza(req, res))
        this.router.post(`/${this.nomePlural}/${this.nomeSingular}`, checkSchema(this.validationSchema), (req, res) => this.adicionaUm(req, res))
    }

    async gerarBusca(req, res) {
        const query = await this.gerarQuery(req, res)

        const exceptBuff = query.except
        delete query.except

        let resultado = await this.DAO.get(query)
        for (let i = 0; i < resultado.length; i++) {

            resultado[i].additionalInfos = await this.partyAdditionalInfoController.gerarBusca({
                query: {
                    partyId: {
                        $eq: resultado[i].id
                    }
                }
            }, res)


            resultado[i].relationships = await this.partyRelationshipsController.gerarBusca({
                query: {
                    sourcePartyId: {
                        $eq: resultado[i].id
                    }
                }
            }, res)


            resultado[i] = await this.prepareResponseJSON(resultado[i], exceptBuff)
        }

        return resultado
    }

}