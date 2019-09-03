const express = require("express")
const DAO = require("../DAO")
const {
    checkSchema,
    validationResult
} = require('express-validator')

const _ = require("lodash")
module.exports = class Controller {
    constructor(tabela, validationSchema, naoGerarTodasRotas) {
        this.router = express.Router()

        this.nome = _.kebabCase(tabela)
        this.DAO = new DAO(tabela)

        this.attrs = []

        this.attrsQuery = []

        this.attrsNotNull = []

        this.validationSchema = {}

        this.fkSchema = {}

        this.gerarValidationSchema(validationSchema)

        if (!naoGerarTodasRotas) {
            this.gerarTodasRotas()
        }
    }

    gerarTodasRotas() {
        this.router.get(`/${this.nome}`, checkSchema(this.validationSchema), async (req, res) => this.busca(req, res))
        this.router.get(`/${this.nome}/:id`, checkSchema(this.validationSchema), async (req, res) => this.buscaUm(req, res))

        this.router.delete(`/${this.nome}`, checkSchema(this.validationSchema), async (req, res) => this.deleta(req, res))
        this.router.delete(`/${this.nome}/:id`, checkSchema(this.validationSchema), async (req, res) => this.deletaUm(req, res))

        this.router.patch(`/${this.nome}`, checkSchema(this.validationSchema), async (req, res) => this.atualiza(req, res))
        this.router.patch(`/${this.nome}/:id`, checkSchema(this.validationSchema), async (req, res) => this.atualizaUm(req, res))

        this.router.post(`/${this.nome}/multiple`, checkSchema(this.validationSchema), async (req, res) => this.adiciona(req, res))
        this.router.post(`/${this.nome}`, checkSchema(this.validationSchema), async (req, res) => this.adicionaUm(req, res))
    }

    gerarValidationSchema(validationSchema) {
        Object.assign(this.validationSchema, validationSchema)

        const keys = Object.keys(this.validationSchema)
        keys.push("id")

        for (let i = 0; i < keys.length; i++) {
            const k = keys[i]

            if (k !== "id") {
                this.attrs.push(k)

                if (this.validationSchema[k].isString === true) {
                    this.validationSchema[k].escape = true
                }

                if (this.validationSchema[k].isInt === true) {
                    this.validationSchema[k].toInt = true
                }

                if (this.validationSchema[k].isDecimal === true) {
                    this.validationSchema[k].customSanitizer = {
                        options: value => parseFloat(value)
                    }
                }

                if (this.validationSchema[k].notNull === true) {
                    this.attrsNotNull.push(k)
                    delete this.validationSchema[k].notNull
                }

                if (this.validationSchema[k].fk) {
                    this.fkSchema[k] = this.validationSchema[k].fk
                    delete this.validationSchema[k].fk
                    this.validationSchema[k].isInt = {
                        options: {
                            min: 1
                        }
                    }
                    this.validationSchema[k].errorMessage = `O valor de ${k} deve ser inteiro maior que 0.`
                }

                this.validationSchema[k].optional = {
                    options: {
                        nullable: true
                    }
                }

                this.validationSchema[k].in = ["body"]

                this.validationSchema.list = {
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
                    errorMessage: "O valor de list deve ser um array."
                }

                this.validationSchema[`list.*.${k}`] = {}
                Object.assign(this.validationSchema[`list.*.${k}`], this.validationSchema[k])

                this.validationSchema[`${k}.$eq`] = {}
                Object.assign(this.validationSchema[`${k}.$eq`], this.validationSchema[k])
                this.validationSchema[`${k}.$eq`].in = ["query"]
            } else {
                this.validationSchema[`${k}.$eq`] = {
                    in: ["query"],
                    isInt: {
                        options: {
                            min: 1
                        }
                    },
                    customSanitizer: {
                        options: value => parseInt(value)
                    },
                    optional: {
                        options: {
                            nullable: true
                        }
                    },
                    errorMessage: "O valor de id deve ser inteiro maior que 0."
                }
                this.validationSchema.id = {
                    in: ["params"],
                    isInt: {
                        options: {
                            min: 1
                        }
                    },
                    customSanitizer: {
                        options: value => parseInt(value)
                    },
                    optional: {
                        options: {
                            nullable: true
                        }
                    },
                    errorMessage: "O valor de id deve ser inteiro maior que 0."
                }
            }

            this.validationSchema[`${k}.$dif`] = {}
            Object.assign(this.validationSchema[`${k}.$dif`], this.validationSchema[`${k}.$eq`])

            this.validationSchema[`${k}.$ls`] = {}
            Object.assign(this.validationSchema[`${k}.$ls`], this.validationSchema[`${k}.$eq`])

            this.validationSchema[`${k}.$lse`] = {}
            Object.assign(this.validationSchema[`${k}.$lse`], this.validationSchema[`${k}.$eq`])

            this.validationSchema[`${k}.$gr`] = {}
            Object.assign(this.validationSchema[`${k}.$gr`], this.validationSchema[`${k}.$eq`])

            this.validationSchema[`${k}.$gre`] = {}
            Object.assign(this.validationSchema[`${k}.$gre`], this.validationSchema[`${k}.$eq`])

            this.validationSchema[`${k}.$in.*`] = {}
            Object.assign(this.validationSchema[`${k}.$in.*`], this.validationSchema[`${k}.$eq`])

            this.validationSchema[`${k}.$in`] = {
                in: ["query"],
                isString: true,
                escape: true,
                customSanitizer: {
                    options: value => value.split(",")
                },
                optional: {
                    options: {
                        nullable: true
                    }
                },
                errorMessage: `O valor de ${k}.$in deve ser uma string de atributos válidos separados por virgula.`
            }
        }

        this.validationSchema["sort.$by"] = {
            in: ["query"],
            custom: {
                options: value => keys.includes(value)
            },
            optional: {
                options: {
                    nullable: true
                }
            },
            errorMessage: "O valor de sort.$by deve ser um atributo válido."
        }

        this.validationSchema["sort.$order"] = {
            in: ["query"],
            custom: {
                options: value => ["asc", "desc"].includes(value)
            },
            optional: {
                options: {
                    nullable: true
                }
            },
            errorMessage: "O valor de sort.$order deve ser asc ou desc."
        }

        this.validationSchema["limit.$count"] = {
            in: ["query"],
            isInt: {
                options: {
                    min: 1
                }
            },
            customSanitizer: {
                options: value => parseInt(value)
            },
            optional: {
                options: {
                    nullable: true
                }
            },
            errorMessage: "O valor de limit.$count deve ser inteiro maior que 0."
        }

        this.validationSchema["limit.$offset"] = {
            in: ["query"],
            isInt: {
                options: {
                    min: 0
                }
            },
            customSanitizer: {
                options: value => parseInt(value)
            },
            optional: {
                options: {
                    nullable: true
                }
            },
            errorMessage: "O valor de limit.$offset deve ser inteiro maior que -1."
        }

        this.validationSchema.except = {
            in: ["query"],
            isString: true,
            escape: true,
            custom: {
                options: value => {
                    const arr = value.split(",")
                    let b = true
                    const k = keys
                    for (let i = 0; i < arr.length; i++) {
                        if (!k.includes(arr[i])) {
                            b = false
                            break
                        }
                    }
                    return b
                }
            },
            customSanitizer: {
                options: value => value.split(",").map(v => _.snakeCase(v))
            },
            optional: {
                options: {
                    nullable: true
                }
            },
            errorMessage: "O valor de except deve ser uma string de atributos válidos separados por virgula."
        }

        this.attrsQuery = keys.concat(["limit", "sort", "except"])
    }

    async busca(req, res) {
        try {
            await this.inicio(req, res, `buscando ${this.nome}...`)

            const resultado = await this.gerarBusca(req, res)

            if (resultado.length === 0) {
                res.status(404).json({
                    errors: [
                        await this.formatError(undefined, req.query, "Objeto não encontrado.", "query")
                    ]
                })
            } else {
                res.status(200).json({
                    results: resultado
                })
            }

            this.fim(req, res)
        } catch (error) {
            this.errorHandler(error, req, res)
        }
    }

    async buscaUm(req, res) {
        try {
            await this.inicio(req, res, `buscando ${this.nome} com id = ${req.params.id}...`)

            const query = {
                id: {
                    $eq: req.params.id
                }
            }

            let resultado = (await this.gerarBusca({
                query
            }, res))[0]

            if (resultado === undefined) {
                res.status(404).json({
                    errors: [
                        await this.formatError("id", req.params.id, "Objeto não encontrado.", "params")
                    ]
                })
            } else {
                res.status(200).json(resultado)
            }

            this.fim(req, res)
        } catch (error) {
            this.errorHandler(error, req, res)
        }
    }

    async gerarBusca(req, res) {
        const query = await this.gerarQuery(req, res)
        const exceptBuff = query.except
        let resultado = await this.DAO.get(query)
        for (let i = 0; i < resultado.length; i++) {
            resultado[i] = await this.prepareResponseJSON(resultado[i], exceptBuff)
        }

        return resultado
    }

    async deleta(req, res) {
        try {
            await this.inicio(req, res, `deletando ${this.nome}...`)

            const resultado = await this.gerarDelecao(req, res)

            res.status(202).json(resultado)

            this.fim(req, res)
        } catch (error) {
            this.errorHandler(error, req, res)
        }
    }

    async deletaUm(req, res) {
        try {
            await this.inicio(req, res, `deletando ${this.nome} com id = ${req.params.id}...`)

            const query = {
                id: {
                    $eq: req.params.id
                }
            }

            const resultado = await this.gerarDelecao({
                query
            }, res)

            res.status(202).json(resultado)

            this.fim(req, res)
        } catch (error) {
            this.errorHandler(error, req, res)
        }
    }

    async gerarDelecao(req, res) {
        const query = await this.gerarQuery(req, res)
        return this.DAO.delete(query)
    }

    async atualiza(req, res) {
        try {
            await this.inicio(req, res, `atualizando ${this.nome}...`)

            const resultado = await this.gerarAtualizacao(req, res)

            res.status(202).json(resultado)

            this.fim(req, res)
        } catch (error) {
            this.errorHandler(error, req, res)
        }
    }

    async atualizaUm(req, res) {
        try {
            await this.inicio(req, res, `atualizando ${this.nome} com id = ${req.params.id}...`)

            const query = {
                id: {
                    $eq: req.params.id
                }
            }

            const resultado = await this.gerarAtualizacao({
                body: req.body,
                query: query
            }, res)

            res.status(202).json(resultado)

            this.fim(req, res)
        } catch (error) {
            this.errorHandler(error, req, res)
        }
    }

    async gerarAtualizacao(req, res) {
        const reqCopy = JSON.parse(JSON.stringify(req))
        delete reqCopy.query.limit
        delete reqCopy.query.sort

        const body = await this.gerarBodyUpdate(reqCopy, res)
        let query = await this.gerarQuery(reqCopy, res)

        return this.DAO.update(body, query)
    }

    async adicionaUm(req, res) {
        try {
            await this.inicio(req, res, `adicionando ${this.nome}...`)

            const resultado = await this.gerarAdicao(req, res)
            res.status(201).json(resultado)

            this.fim(req, res)
        } catch (error) {
            this.errorHandler(error, req, res)
        }
    }

    async adiciona(req, res) {
        try {
            await this.inicio(req, res, `adicionando ${this.nome}...`)

            let resultado = []
            for (let i = 0; i < req.body.list.length; i++) {
                const r = await this.gerarAdicao({
                    body: req.body.list[i]
                }, res, `list[${i}]`)
                resultado.push(r)
            }

            res.status(201).json({
                results: resultado
            })

            this.fim(req, res)
        } catch (error) {
            this.errorHandler(error, req, res)
        }
    }

    async gerarAdicao(req, res, addInfo) {
        const body = await this.gerarBodyAdd(req, res, addInfo)
        return this.DAO.add(body)
    }

    async prepareResponseJSON(json, except) {
        let o = JSON.parse(JSON.stringify(json))

        let exc = undefined
        if (except !== undefined) {
            if (!(except instanceof Array)) {
                exc = except.split(",").map(v => _.camelCase(v))
            } else {
                exc = except.map(v => _.camelCase(v))
            }
        }

        const keys = Object.keys(o)
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i]
            const cck = _.camelCase(k)

            if (exc === undefined || !exc.includes(cck)) {
                const buff = o[k]

                if (this.fkSchema[cck] !== undefined) {
                    let nomeLink = cck.slice(0, -2)
                    o[nomeLink] = {}
                    o[nomeLink].id = buff
                    o[nomeLink].link = {
                        rel: "self",
                        href: `/${this.fkSchema[cck]}/${buff}`,
                        type: "GET"
                    }
                } else {
                    o[cck] = buff
                }

                if (k !== cck) {
                    delete o[k]
                }
            } else {
                delete o[k]
            }

        }

        return o
    }

    async gerarJSON(req, res, location, attrs, obligatory, allObligatory, addInfo) {
        let o = {}

        let errors = []

        let addInfoDots = ""
        if (addInfo !== undefined) {
            addInfoDots = `${addInfo}.`
        }

        for (let i = 0; i < attrs.length; i++) {
            const attr = attrs[i]
            const value = req[location][attr]

            if (value === undefined && allObligatory) {
                errors.push(await this.formatError(attr, value, "O valor deve ser informado.", `${addInfoDots}${location}`))
            } else if (value === null && obligatory && obligatory.includes(attr)) {
                errors.push(await this.formatError(attr, value, "O valor não pode ser nulo.", `${addInfoDots}${location}`))
            } else if (value !== undefined) {
                o[_.snakeCase(attr)] = value
            }
        }

        if (Object.keys(o).length === 0) {
            res.status(400).json(await this.formatError(undefined, undefined, `O request ${location} está vazio ou não possue algum atributo válido.`, addInfo))

            throw new Error("Empty object.")
        }

        if (errors.length > 0) {
            res.status(400).json(errors)

            throw new Error("Not Null error.")
        }

        return o
    }

    async gerarBodyAdd(req, res, addInfo) {
        return this.gerarJSON(req, res, "body", this.attrs, this.attrsNotNull, true, addInfo)
    }

    async gerarBodyUpdate(req, res) {
        return this.gerarJSON(req, res, "body", this.attrs, this.attrsNotNull, false)
    }

    async gerarQuery(req, res) {
        let o = {}

        let errors = []

        if (req.query.sort) {
            if (req.query.sort.$by === undefined) {
                errors.push(await this.formatError("$by", undefined, "O valor deve ser informado.", "query.sort"))
            } else if (req.query.sort.$order === undefined) {
                errors.push(await this.formatError("$order", undefined, "O valor deve ser informado.", "query.sort"))
            } else {
                o.sort = {}
                Object.assign(o.sort, req.query.sort)
            }
        }

        if (req.query.limit) {
            if (req.query.limit.$count === undefined) {
                errors.push(await this.formatError("$count", undefined, "O valor deve ser informado.", "query.limit"))
            } else {
                o.limit = {}
                Object.assign(o.limit, req.query.limit)
            }
        }

        if (req.query.except && req.query.except.length === 0) {
            errors.push(await this.formatError("except", undefined, "O valor não pode ser um array vazio.", "query"))
        } else {
            o.except = req.query.except
        }

        if (errors.length > 0) {
            res.status(400).json(errors)

            throw new Error("Not Null error.")
        }

        const ops = ["$eq", "$dif", "$ls", "$lse", "$gr", "$gre", "$in"]
        for (let i = 0; i < this.attrsQuery.length; i++) {
            const attr = this.attrsQuery[i]
            if (req.query[attr] && attr !== "limit" && attr !== "sort" && attr !== "except") {
                o[_.snakeCase(attr)] = {}

                for (let j = 0; j < ops.length; j++) {
                    const op = ops[j]
                    if (req.query[attr][op]) {
                        o[_.snakeCase(attr)][op] = req.query[attr][op]
                    }
                }

                if (Object.keys(o[_.snakeCase(attr)]).length === 0) {
                    delete o[_.snakeCase(attr)]
                }
            }
        }

        return o
    }

    async errorHandler(erro, req, res) {
        const ok = erro.message.includes("Validation Errors.") || erro.message.includes("Empty object.") || erro.message.includes("Not Null error.")
        if (!ok) {
            if (erro.errno === 1452) {
                res.status(404).json({
                    errors: [await this.formatError(undefined, erro.sql, "Foreign Key não cadastrada.")]
                })
            } else {
                res.status(500).json({
                    errors: [await this.formatError(undefined, undefined, "Erro no servidor.")]
                })
            }
            console.log(erro)
        }
        this.fim(req, res)
    }

    async formatError(param, value, msg, location) {
        return {
            location,
            msg,
            param,
            value
        }
    }

    async inicio(req, res, mensagem) {
        console.log(`request id: ${req.id} -> ${mensagem}`)

        const validationErrors = validationResult(req)
        if (validationErrors.errors.length > 0) {
            res.status(400).json(validationErrors)

            throw new Error("Validation Errors.")
        }
    }

    async fim(req, res) {
        res.end()
        console.log(`request id: ${req.id} -> fim`)
    }

}