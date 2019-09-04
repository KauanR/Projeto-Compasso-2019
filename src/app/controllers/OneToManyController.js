const Controller = require("./Controller")

const {
    checkSchema
} = require('express-validator')

module.exports = class PartyController extends Controller {
    constructor(tabela, validationSchema, naoGerarTodasRotas, controllersSchema) {
        super(tabela, validationSchema, true)

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

        this.validationSlaveSchemas = {}

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

            this.router.get(`/${this.nome}/:${fk}/${name}`, checkSchema(this.validationSlaveSchemas[name]), async (req, res) => {
                let slaveQuery = req.query
                slaveQuery[fk] = {
                    $eq: req.params.id,
                }
                slaveQuery.except = fk
                slaveController.busca({
                    id: req.id,
                    query: slaveQuery
                }, res)
            })

            this.router.delete(`/${this.nome}/:${fk}/${name}`, checkSchema(this.validationSlaveSchemas[name]), async (req, res) => {
                let slaveQuery = req.query
                slaveQuery[fk] = {
                    $eq: req.params.id
                }
                slaveController.deleta({
                    id: req.id,
                    query: slaveQuery
                }, res)
            })

            this.router.patch(`/${this.nome}/:${fk}/${name}`, checkSchema(this.validationSlaveSchemas[name]), async (req, res) => {
                let slaveQuery = req.query
                slaveQuery[fk] = {
                    $eq: req.params.id
                }
                slaveController.atualiza({
                    id: req.id,
                    query: slaveQuery,
                    body: req.body
                }, res)
            })

            this.router.post(`/${this.nome}/:${fk}/${name}`, checkSchema(this.validationSlaveSchemas[name]), async (req, res) => {
                let reqCopy = {}
                Object.assign(reqCopy, req) 

                if(reqCopy.body.list !== undefined){
                    reqCopy.body.list = reqCopy.body.list.map(i => {
                        let buff = {}
                        Object.assign(buff, i)
                        buff[fk] = reqCopy.params.id
                        return buff
                    })
                }

                slaveController.adiciona({
                    id: reqCopy.id,
                    body: reqCopy.body
                }, res)
            })
        }
    }

    async gerarSlaveSchemas() {
        for (let i = 0; i < this.controllersNames.length; i++) {
            const name = this.controllersNames[i]
            const vs = this.controllersSchema[name].controller.validationSchema

            this.validationSlaveSchemas[name] = {}
            Object.assign(this.validationSlaveSchemas[name], vs)

            const fk = this.controllersSchema[name].fkToThis
            this.validationSlaveSchemas[name][fk] = {}
            Object.assign(this.validationSlaveSchemas[name][fk], this.validationSchema.id)

            let r = {}

            const vsKeys = Object.keys(vs)
            for (let j = 0; j < vsKeys.length; j++) {
                const k = vsKeys[j]
                if ( vs[k].in.includes("body") && k !== fk && k !== "list" && !( k.includes("list.*") ) ) {
                    r[`${name}.*.${k}`] = {}
                    Object.assign(r[`${name}.*.${k}`], vs[k])

                    r[`list.*.${name}.*.${k}`] = {}
                    Object.assign(r[`list.*.${name}.*.${k}`], vs[k])
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

            Object.assign(this.validationSchema, r)
        }
    }

    async gerarAdicao(req, res, addInfo) {
        let resultado = {}

        let buff = {}

        for (let i = 0; i < this.controllersNames.length; i++) {
            const name = this.controllersNames[i]
            buff[name] = req.body[name]
            delete req.body[name]
        }

        const body = await this.gerarBodyAdd(req, res, addInfo)
        const resultMaster = await this.DAO.add(body)

        Object.assign(resultado, resultMaster)

        let a = ""
        if(addInfo !== undefined){
            a = `${addInfo}.`
        }

        for (let i = 0; i < this.controllersNames.length; i++) {
            const name = this.controllersNames[i]
            const fk = this.controllersSchema[name].fkToThis

            if (buff[name] !== undefined) {
                let slaveResults = []
                for (let j = 0; j < buff[name].length; j++) {
                    buff[name][j][fk] = resultMaster.insertId

                    slaveResults.push(await this.controllersSchema[name].controller.gerarAdicao({
                        body: buff[name][j]
                    }, res, `${a}${name}[${j}]`))
                }
                resultado[`${name}Results`] = slaveResults
            }
        }

        return resultado
    }

    async gerarBusca(req, res) {
        const query = await this.gerarQuery(req, res)
        const exceptBuff = query.except

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