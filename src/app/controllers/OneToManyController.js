const Controller = require("./Controller")

const {
    checkSchema
} = require('express-validator')

module.exports = class PartyController extends Controller {
    constructor(nomeSingular, nomePlural, tabela, validationSchema, naoGerarTodasRotas, controllersSchema) {
        super(nomeSingular, nomePlural, tabela, validationSchema, true)

        this.controllersSchema = controllersSchema
        this.controllersNames = Object.keys(controllersSchema)

        this.validationSchema.except.custom = {
            options: value => {
                const arr = this.controllersNames.concat(this.attrs)
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

        this.gerarSlaveSchemas()

        if (!naoGerarTodasRotas) {
            this.gerarTodasRotas()
        }
    }

    gerarTodasRotas() {
        super.gerarTodasRotas()

        for (let i = 0; i < this.controllersNames.length; i++) {
            const name = this.controllersNames[i]
            const slaveController = this.controllersSchema[name].controller
            const fk = this.controllersSchema[name].fkToThis

            this.router.get(`/${this.nomePlural}/${this.nomeSingular}/:${fk}/${slaveController.nomePlural}`, checkSchema(slaveController.validationSchema), (req, res) => {
                let slaveQuery = req.query
                slaveQuery[fk] = {
                    $eq: req.params[fk]
                }
                slaveController.busca({
                    id: req.id,
                    query: slaveQuery
                }, res)
            })

            this.router.delete(`/${this.nomePlural}/${this.nomeSingular}/:${fk}/${slaveController.nomePlural}`, checkSchema(slaveController.validationSchema), (req, res) => {
                let slaveQuery = req.query
                slaveQuery[fk] = {
                    id: req.id,
                    $eq: req.params[fk]
                }
                slaveController.deleta({
                    query: slaveQuery
                }, res)
            })

            this.router.patch(`/${this.nomePlural}/${this.nomeSingular}/:${fk}/${slaveController.nomePlural}`, checkSchema(slaveController.validationSchema), (req, res) => {
                let slaveQuery = req.query
                slaveQuery[fk] = {
                    id: req.id,
                    $eq: req.params[fk]
                }
                slaveController.atualiza({
                    id: req.id,
                    query: slaveQuery,
                    body: req.body
                }, res)
            })

            this.router.post(`/${this.nomePlural}/${this.nomeSingular}/:${fk}/${slaveController.nomePlural}/${slaveController.nomeSingular}`, checkSchema(slaveController.validationSchema), (req, res) => {
                let slaveBody = req.body
                slaveBody[fk] = req.params[fk]
                slaveController.adicionaUm({
                    id: req.id,
                    body: slaveBody
                }, res)
            })
        }
    }

    async gerarSlaveSchemas() {
        for (let i = 0; i < this.controllersNames.length; i++) {
            const name = this.controllersNames[i]
            const vs = this.controllersSchema[name].controller.validationSchema
            const fk = this.controllersSchema[name].fkToThis

            let r = {}

            const vsKeys = Object.keys(vs)
            for (let j = 0; j < vsKeys.length; j++) {
                const k = vsKeys[j]
                if (vs[k].in.includes("body") && k !== fk) {
                    r[`${name}.*.${k}`] = vs[k]
                }
            }
            r[name] = {
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
                errorMessage: `O valor de ${name} deve ser um array e deve ter pelo menos 1 elemento.`
            }
            r[fk] = this.validationSchema.id

            Object.assign(this.validationSchema, r)
        }
    }

    async gerarAdicao(req, res) {
        let resultado = {}

        let buff = {}

        for (let i = 0; i < this.controllersNames.length; i++) {
            const name = this.controllersNames[i]
            buff[name] = req.body[name]
            delete req.body[name]
        }

        const body = await this.gerarBodyAdd(req, res)
        const resultMaster = await this.DAO.add(body)

        Object.assign(resultado, resultMaster)

        for (let i = 0; i < this.controllersNames.length; i++) {
            const name = this.controllersNames[i]
            const fk = this.controllersSchema[name].fkToThis

            if (buff[name] !== undefined) {
                let slaveResults = []
                for (let j = 0; j < buff[name].length; j++) {
                    buff[name][j][fk] = resultMaster.insertId

                    const bodySlave = await this.controllersSchema[name].controller.gerarBodyAdd({
                        body: buff[name][j]
                    }, res)
                    slaveResults.push(await this.controllersSchema[name].controller.DAO.add(bodySlave))
                }
                resultado[`${name}Results`] = slaveResults
            }
        }

        return resultado
    }

    async gerarBusca(req, res) {
        const query = await this.gerarQuery(req, res)
        const exceptBuff = query.except
        delete query.except

        let resultado = await this.DAO.get(query)
        for (let i = 0; i < resultado.length; i++) {

            for (let l = 0; l < this.controllersNames.length; l++) {
                const name = this.controllersNames[l]
                const fk = this.controllersSchema[name].fkToThis

                let querySlave = {
                    except: fk
                }
                querySlave[fk] = {
                    $eq: resultado[i].id
                }
                resultado[i][name] = await this.controllersSchema[name].controller.gerarBusca({
                    query: querySlave
                }, res)
            }

            resultado[i] = await this.prepareResponseJSON(resultado[i], exceptBuff)
        }

        return resultado
    }

}