const express = require("express")
const DAO = require("../DAO")
const {
    checkSchema,
    validationResult
} = require('express-validator')

const _ = require("lodash")
module.exports = class Controller {
    constructor(nomeSingular, nomePlural, tabela, validationSchema, naoGerarTodasRotas) {
        this.router = express.Router()

        this.nomeSingular = nomeSingular
        this.nomePlural = nomePlural
        this.DAO = new DAO(tabela)

        this.attrs = []

        this.attrsQuery = []

        this.attrNotNull = []

        this.validationSchema = {}

        this.fkSchema = {}

        Object.assign(this.validationSchema, this.gerarValidationSchema(validationSchema))

        if (!naoGerarTodasRotas) {
            this.router.get(`/${this.nomePlural}`, checkSchema(this.validationSchema), (req, res) => this.busca(req, res))
            this.router.delete(`/${this.nomePlural}`, checkSchema(this.validationSchema), (req, res) => this.deleta(req, res))
            this.router.post(`/${this.nomePlural}`, checkSchema(this.validationSchema), (req, res) => this.atualiza(req, res))
            this.router.post(`/${this.nomePlural}/${this.nomeSingular}`, checkSchema(this.validationSchema), (req, res) => this.adicionaUm(req, res))
        }
    }

    gerarValidationSchema(validationSchema) {
        const copy = JSON.parse(JSON.stringify(validationSchema))

        const keys = Object.keys(copy)
        keys.push("id")

        for (let i = 0; i < keys.length; i++) {
            const k = keys[i]

            if (k !== "id") {
                this.attrs.push(k)

                if (copy[k].isString === true) {
                    copy[k].escape = true
                }

                if (copy[k].isInt === true) {
                    copy[k].toInt = true
                }

                if (copy[k].isDecimal === true) {
                    copy[k].customSanitizer = {
                        options: value => parseFloat(value)
                    }
                }

                if (copy[k].notNull === true) {
                    this.attrNotNull.push(k)
                    delete copy[k].notNull
                }

                if (copy[k].fk) {
                    this.fkSchema[k] = copy[k].fk
                    delete copy[k].fk
                    copy[k].isInt = {
                        options: {
                            min: 1
                        }
                    }
                    copy[k].errorMessage = `O valor de ${k} deve ser inteiro maior que 0.`
                }

                copy[k].optional = {
                    options: {
                        nullable: true
                    }
                }

                copy[k].in = ["body"]

                copy[`${k}.$eq`] = {}
                Object.assign(copy[`${k}.$eq`], copy[k])
                copy[`${k}.$eq`].in = ["query"]
            } else {
                copy[`${k}.$eq`] = {
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
            }

            copy[`${k}.$dif`] = {}
            Object.assign(copy[`${k}.$dif`], copy[`${k}.$eq`])

            copy[`${k}.$ls`] = {}
            Object.assign(copy[`${k}.$ls`], copy[`${k}.$eq`])

            copy[`${k}.$lse`] = {}
            Object.assign(copy[`${k}.$lse`], copy[`${k}.$eq`])

            copy[`${k}.$gr`] = {}
            Object.assign(copy[`${k}.$gr`], copy[`${k}.$eq`])

            copy[`${k}.$gre`] = {}
            Object.assign(copy[`${k}.$gre`], copy[`${k}.$eq`])

            copy[`${k}.$in.*`] = {}
            Object.assign(copy[`${k}.$in.*`], copy[`${k}.$eq`])

            copy[`${k}.$in`] = {
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

        copy["sort.$by"] = {
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

        copy["sort.$order"] = {
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

        copy["limit.$count"] = {
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

        copy["limit.$offset"] = {
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

        copy.except = {
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
                options: value => value.split(",")
            },
            optional: {
                options: {
                    nullable: true
                }
            },
            errorMessage: "O valor de except deve ser uma string de atributos válidos separados por virgula."
        }

        this.attrsQuery = keys.concat(["limit", "sort", "except"])

        return copy
    }

    async busca(req, res) {
        try {
            await this.inicio(req, res, `buscando ${this.nomePlural}...`)

            const resultado = await this.gerarBusca(req, res)

            res.status(200).json(resultado)

            this.fim(req, res)
        } catch (error) {
            this.errorHandler(error, req, res)
        }
    }

    async gerarBusca(req, res) {
        const query = await this.gerarQuery(req, res)
        const exceptBuff = query.except
        delete query.except

        let resultado = await this.DAO.get(query)
        for (let i = 0; i < resultado.length; i++) {
            resultado[i] = await this.prepareResponseJSON(resultado[i], exceptBuff)
        }

        return resultado
    }

    async deleta(req, res) {
        try {
            await this.inicio(req, res, `deletando ${this.nomePlural}...`)

            const resultado = await this.gerarDelecao(req, res)
            res.status(202).json(resultado)

            this.fim(req, res)
        } catch (error) {
            this.errorHandler(error, req, res)
        }
    }

    async gerarDelecao(req, res) {
        const query = await this.gerarQuery(req, res)
        delete query.except
        return this.DAO.delete(query)
    }

    async atualiza(req, res) {
        try {
            await this.inicio(req, res, `atualizando ${this.nomePlural}...`)

            const resultado = await this.gerarAtualizacao(req, res)
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

        delete query.except
        return this.DAO.update(body, query)
    }

    async adicionaUm(req, res) {
        try {
            await this.inicio(req, res, `adicionando ${this.nomeSingular}...`)

            const resultado = await this.gerarAdicao(req, res)
            res.status(201).json(resultado)

            this.fim(req, res)
        } catch (error) {
            this.errorHandler(error, req, res)
        }
    }

    async gerarAdicao(req, res) {
        const body = await this.gerarBodyAdd(req, res)
        return this.DAO.add(body)
    }

    async prepareResponseJSON(json, except) {
        const o = JSON.parse(JSON.stringify(json))

        const keys = Object.keys(o)
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i]
            const cck = _.camelCase(k)
            if (except === undefined || !except.includes(cck)) {
                const buff = o[k]
                delete o[k]
                o[cck] = buff
                if (this.fkSchema[cck] !== undefined) {
                    let nomeLink = k.slice(0, -3)
                    nomeLink = `${_.camelCase(k.slice(0, -3))}Link`
                    o[nomeLink] = {
                        rel: "self",
                        href: `/${this.fkSchema[cck]}?id[$eq]=${o[cck]}`,
                        type: "GET"
                    }
                }
            } else {
                delete o[k]
            }
        }

        return o
    }

    async gerarJSON(req, res, location, attrs, obligatory, allObligatory) {
        let o = {}

        let errors = []

        for (let i = 0; i < attrs.length; i++) {
            const attr = attrs[i]
            const value = req[location][attr]

            if (value === undefined && allObligatory) {
                errors.push(await this.formatError(attr, value, "O valor deve ser informado.", location))
            } else if (value === null && obligatory && obligatory.includes(attr)) {
                errors.push(await this.formatError(attr, value, "O valor não pode ser nulo.", location))
            } else if (value !== undefined) {
                o[_.snakeCase(attr)] = value
            }
        }

        if (Object.keys(o).length === 0) {
            res.status(400).json(await this.formatError(undefined, undefined, `O request ${location} está vazio ou não possue algum atributo válido.`))

            throw new Error("Empty object.")
        }

        if (errors.length > 0) {
            res.status(400).json(errors)

            throw new Error("Not Null error.")
        }

        return o
    }

    async gerarBodyAdd(req, res) {
        return this.gerarJSON(req, res, "body", this.attrs, this.attrNotNull, true)
    }

    async gerarBodyUpdate(req, res) {
        return this.gerarJSON(req, res, "body", this.attrs, this.attrNotNull, false)
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
            } else if (req.query.limit.$offset === undefined) {
                errors.push(await this.formatError("$offset", undefined, "O valor deve ser informado.", "query.limit"))
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

        if (Object.keys(o).length === 0) {
            res.status(400).json(await this.formatError(undefined, undefined, `O request query está vazio ou não possue algum atributo válido.`))

            throw new Error("Empty object.")
        }

        return o
    }

    async errorHandler(erro, req, res) {
        console.log(erro)
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