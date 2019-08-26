const express = require("express")
const DAO = require("../DAO")
const {
    checkSchema,
    validationResult
} = require('express-validator')

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
                if (copy[k].isString === true) {
                    copy[k].escape = true
                }

                if (copy[k].notNull) {
                    this.attrNotNull.push(k)
                    delete copy[k].notNull
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
                    optional: {
                        options: {
                            nullable: true
                        }
                    },
                    errorMessage: "O valor deve ser inteiro maior que 0."
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
                in: ["query"],
                optional: {
                    options: {
                        nullable: true
                    }
                },
                custom: {
                    options: value => value instanceof Array
                },
                errorMessage: "O valor deve ser um array."
            }
        }

        copy["sort.by"] = {
            in: ["query"],
            isIn: keys,
            optional: {
                options: {
                    nullable: true
                }
            },
            errorMessage: "O valor deve ser um atributo válido."
        }

        copy["sort.order"] = {
            in: ["query"],
            isIn: ["asc", "desc"],
            optional: {
                options: {
                    nullable: true
                }
            },
            errorMessage: "O valor deve ser asc ou desc."
        }

        copy["limit.count"] = {
            in: ["query"],
            isInt: {
                options: {
                    min: 1
                }
            },
            optional: {
                options: {
                    nullable: true
                }
            },
            errorMessage: "O valor deve ser inteiro maior que 0."
        }

        copy["limit.offset"] = {
            in: ["query"],
            isInt: {
                options: {
                    min: 0
                }
            },
            optional: {
                options: {
                    nullable: true
                }
            },
            errorMessage: "O valor deve ser inteiro maior que -1."
        }

        this.attrs = keys
        this.attrsQuery = keys.concat(["limit", "sort"])

        return copy
    }

    async busca(req, res) {
        try {
            await this.inicio(req, res, `buscando ${this.nomePlural}...`)

            const query = await this.gerarQuery(req, res)

            const resultado = await this.DAO.get(query)
            res.status(200).json(resultado)

            this.fim(req, res)
        } catch (error) {
            this.errorHandler(error, req, res)
        }
    }

    async deleta(req, res) {
        try {
            await this.inicio(req, res, `deletando ${this.nomePlural}...`)

            const query = await this.gerarQuery(req, res)

            const resultado = await this.DAO.delete(query)
            res.status(202).json(resultado)

            this.fim(req, res)
        } catch (error) {
            this.errorHandler(error, req, res)
        }
    }

    async atualiza(req, res) {
        try {
            await this.inicio(req, res, `atualizando ${this.nomePlural}...`)

            const body = await this.gerarBodyUpdate(req, res)
            const query = await this.gerarQuery(req, res)

            const resultado = await this.DAO.update(body, query)
            res.status(202).json(resultado)

            this.fim(req, res)
        } catch (error) {
            this.errorHandler(error, req, res)
        }
    }

    async adicionaUm(req, res) {
        try {
            await this.inicio(req, res, `adicionando ${this.nomeSingular}...`)

            const body = await this.gerarBodyAdd(req, res)

            const resultado = await this.DAO.add(body)
            res.status(201).json(resultado)

            this.fim(req, res)
        } catch (error) {
            this.errorHandler(error, req, res)
        }
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
                o[attr] = value
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
            if (!req.query.sort.by) {
                errors.push(await this.formatError("by", "O valor deve ser informado.", "query.sort"))
            } else if (!req.query.sort.order) {
                errors.push(await this.formatError("order", "O valor deve ser informado.", "query.sort"))
            } else {
                o.sort = {}
                Object.assign(o.sort, req.query.sort)
            }
        }

        if (req.query.limit) {
            if (!req.query.limit.count) {
                errors.push(await this.formatError("count", "O valor deve ser informado.", "query.limit"))
            } else if (!req.query.limit.offset) {
                errors.push(await this.formatError("offset", "O valor deve ser informado.", "query.limit"))
            } else {
                o.limit = {}
                Object.assign(o.limit, req.query.limit)
            }
        }

        for (let i = 0; i < this.attrsQuery.length; i++) {
            const attr = this.attrsQuery[i]
            if (req.query[attr] && attr !== "limit" && attr !== "sort") {
                o[attr] = {}
                if (req.query[attr].$eq) {
                    o[attr].$eq = req.query[attr].$eq
                }
                if (req.query[attr].$dif) {
                    o[attr].$dif = req.query[attr].$dif
                }
                if (req.query[attr].$ls) {
                    o[attr].$ls = req.query[attr].$ls
                }
                if (req.query[attr].$lse) {
                    o[attr].$lse = req.query[attr].$lse
                }
                if (req.query[attr].$gr) {
                    o[attr].$gr = req.query[attr].$gr
                }
                if (req.query[attr].$gre) {
                    o[attr].$gre = req.query[attr].$gre
                }
                if (req.query[attr].$in) {
                    o[attr].$in = req.query[attr].$in
                }
                if (Object.keys(o[attr]).length === 0) {
                    delete o[attr]
                }
            }
        }

        if (Object.keys(o).length === 0) {
            res.status(400).json(await this.formatError(undefined, undefined, `O request query está vazio ou não possue algum atributo válido.`))

            throw new Error("Empty object.")
        }

        if (errors.length > 0) {
            res.status(400).json(errors)

            throw new Error("Not Null error.")
        }

        return o
    }

    async errorHandler(erro, req, res) {
        console.log(erro)
        const ok = erro.message.includes("Validation Errors.") || erro.message.includes("Empty object.") || erro.message.includes("Not Null error.")
        if (!ok) {
            res.status(500).json({
                errors: [await this.formatError(undefined, undefined, "Erro no servidor.")]
            })
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