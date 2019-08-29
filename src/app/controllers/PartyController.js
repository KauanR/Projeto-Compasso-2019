const Controller = require("./Controller")
const PartyRelationshipsController = require("./PartyRelationshipsController")
const PartyAdditionalInfoController = require("./PartyAdditionalInfoController")

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

        this.gerarChildSchemas()

        this.gerarTodasRotas()
    }

    async gerarChildSchemas() {
        let ai = {}
        let r = {}
        let aiSchema = this.partyAdditionalInfoController.validationSchema
        let rSchema = this.partyRelationshipsController.validationSchema

        const aiSchemaKeys = Object.keys(aiSchema)
        for (let i = 0; i < aiSchemaKeys.length; i++) {
            const k = aiSchemaKeys[i]
            if (aiSchema[k].in.includes("body") && k !== "partyId") {
                ai[`additionalInfos.*.${k}`] = aiSchema[k]
            }
        }
        r.additionalInfos = {
            in: ["body"],
            isLength: {
                options: {
                    min: 1
                }
            },
            custom: {
                options: value => value instanceof Array
            },
            optional: {
                options: {
                    nullable: true
                }
            },
            errorMessage: "O valor de additionalInfos deve ser um array e deve ter pelo menos 1 elemento."
        }

        const rSchemaKeys = Object.keys(rSchema)
        for (let i = 0; i < rSchemaKeys.length; i++) {
            const k = rSchemaKeys[i]
            if (rSchema[k].in.includes("body") && k !== "sourcePartyId") {
                r[`relationships.*.${k}`] = rSchema[k]
            }
        }
        r.relationships = {
            in: ["body"],
            isLength: {
                options: {
                    min: 1
                }
            },
            custom: {
                options: value => value instanceof Array
            },
            optional: {
                options: {
                    nullable: true
                }
            },
            errorMessage: "O valor de relationships deve ser um array e deve ter pelo menos 1 elemento."
        }

        Object.assign(this.validationSchema, ai)
        Object.assign(this.validationSchema, r)
    }

    async gerarAdicao(req, res) {
        let resultado = {}

        const additionalInfosBuff = req.body.additionalInfos
        delete req.body.additionalInfos

        const relationshipsBuff = req.body.relationships
        delete req.body.relationships

        const body = await this.gerarBodyAdd(req, res)
        const resultParty = await this.DAO.add(body)

        let additionalInfosResults = []
        if (additionalInfosBuff !== undefined) {
            for (let i = 0; i < additionalInfosBuff.length; i++) {
                additionalInfosBuff[i].partyId = resultParty.insertId
                const bodyA = await this.partyAdditionalInfoController.gerarBodyAdd({
                    body: additionalInfosBuff[i]
                }, res)
                additionalInfosResults.push(await this.partyAdditionalInfoController.DAO.add(bodyA))
            }
        }

        let relationshipsResults = []
        if (relationshipsBuff !== undefined) {
            for (let i = 0; i < relationshipsBuff.length; i++) {
                relationshipsBuff[i].sourcePartyId = resultParty.insertId
                const bodyA = await this.partyRelationshipsController.gerarBodyAdd({
                    body: relationshipsBuff[i]
                }, res)
                relationshipsResults.push(await this.partyRelationshipsController.DAO.add(bodyA))
            }
        }

        if (additionalInfosBuff === undefined && relationshipsBuff === undefined) {
            return resultParty
        }
        if (additionalInfosBuff !== undefined && relationshipsBuff === undefined) {
            resultado.resultParty = resultParty
            resultado.additionalInfosResults = additionalInfosResults
            return resultado
        }
        if (additionalInfosBuff === undefined && relationshipsBuff !== undefined) {
            resultado.resultParty = resultParty
            resultado.relationshipsResults = relationshipsResults
            return resultado
        }
        resultado.resultParty = resultParty
        resultado.relationshipsResults = relationshipsResults
        resultado.additionalInfosResults = additionalInfosResults
        return resultado
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
                    },
                    except: "partyId"
                }
            }, res)

            resultado[i].relationships = await this.partyRelationshipsController.gerarBusca({
                query: {
                    sourcePartyId: {
                        $eq: resultado[i].id
                    },
                    except: "sourcePartyId"
                }
            }, res)

            for (let j = 0; j < resultado[i].relationships.length; j++) {

                resultado[i].relationships[j].targetParty = (await this.DAO.get({
                    id: {
                        $eq: resultado[i].relationships[j].targetPartyId
                    }
                }))[0]

                delete resultado[i].relationships[j].targetPartyLink
                delete resultado[i].relationships[j].targetPartyId

            }

            resultado[i] = await this.prepareResponseJSON(resultado[i], exceptBuff)
        }

        return resultado
    }

}