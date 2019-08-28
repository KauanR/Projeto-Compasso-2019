const Controller = require("./Controller")

const DAO = require("../DAO")

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
            last_assessment: {
                isISO8601: true,
                notNull: true,
                errorMessage: "O valor de last_assessment deve ser uma data no formato ISO8601."
            },
            observations: {
                isString: true,
                notNull: true,
                errorMessage: "O valor de observations deve ser uma string."
            }
        })

        this.router.get(`/${this.nomePlural}`, checkSchema(this.validationSchema), (req, res) => this.buscaTodosDados(req, res))
    }

    async buscaTodosDados(req, res) {
        try {
            await this.inicio(req, res, `buscando ${this.nomePlural} todos os dados...`)

            const query = await this.gerarQuery(req, res)

            const paiDAO = new DAO("party_additional_info")
            const prDAO = new DAO("party_relationships")

            let resultado = await this.DAO.get(query)
            for (let i = 0; i < resultado.length; i++) {
                resultado[i] = await this.converterFkEmLink(resultado[i])

                resultado[i].additional_info = await paiDAO.get({
                    party_id:{
                        $eq: resultado[i].id
                    }
                })

                resultado[i].relationships = await prDAO.get({
                    source_party_id:{
                        $eq: resultado[i].id
                    }
                })

            }

            res.status(200).json(resultado)

            this.fim(req, res)
        } catch (error) {
            this.errorHandler(error, req, res)
        }
    }

}