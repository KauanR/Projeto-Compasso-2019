const Controller = require("./Controller")

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

        this.gerarSlaveSchemas()

        if (!naoGerarTodasRotas) {
            this.gerarTodasRotas()
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