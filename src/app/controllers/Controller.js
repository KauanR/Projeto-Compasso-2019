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
            this.gerarRotaBusca()
            this.gerarRotaDeleta()
            this.gerarRotaAtualiza()
            this.gerarRotaAdicionaUm()
        }
    }

    gerarValidationSchema(validationSchema) {
        const copy = JSON.parse(JSON.stringify(validationSchema))

        const keys = Object.keys(copy)

        for (let i = 0; i < keys.length; i++) {
            const k = keys[i]

            copy[k].in = ["query", "body"]

            if (copy[k].notNull) {
                this.attrNotNull.push(k)
                delete copy[k].notNull
            }
        }

        Object.assign(copy, {
            id: {
                in: ["query"],
                isInt: {
                    options: {
                        min: 1
                    }
                },
                errorMessage: "O valor deve ser inteiro maior que 0."
            },
            limite: {
                in: ["query"],
                isInt: {
                    options: {
                        min: 1
                    }
                },
                errorMessage: "O valor deve ser inteiro maior que 0."
            },
            ordem: {
                in: ["query"],
                isIn: ["ASC", "DESC"],
                errorMessage: "O valor deve ser ASC ou DESC."
            },
            ordenarPor: {
                in: ["query"],
                isIn: ["id"].concat(keys),
                errorMessage: "O valor deve ser um atributo válido."
            },
            "*": {
                optional: {
                    options: {
                        nullable: true
                    }
                }
            }
        })

        this.attrs = keys
        this.attrsQuery = Object.keys(copy)

        return copy
    }

    gerarRotaBusca() {
        this.router.get(`/${this.nomePlural}`, checkSchema(this.validationSchema), async (req, res) => {
            try {
                await this.inicio(req, res, `buscando ${this.nomePlural}...`)

                const query = await this.gerarQuery(req, res)

                const resultado = await this.DAO.get(query)
                res.status(200).json(resultado)

                this.fim(req, res)
            } catch (error) {
                this.errorHandler(error, req, res)
            }
        })
    }

    gerarRotaDeleta() {
        this.router.delete(`/${this.nomePlural}`, checkSchema(this.validationSchema), async (req, res) => {
            try {
                await this.inicio(req, res, `deletando ${this.nomePlural}...`)

                const query = await this.gerarQuery(req, res)

                const resultado = await this.DAO.delete(query)
                res.status(202).json(resultado)

                this.fim(req, res)
            } catch (error) {
                this.errorHandler(error, req, res)
            }
        })
    }

    gerarRotaAtualiza() {
        this.router.post(`/${this.nomePlural}`, checkSchema(this.validationSchema), async (req, res) => {
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
        })
    }

    gerarRotaAdicionaUm() {
        this.router.post(`/${this.nomePlural}/${this.nomeSingular}`, checkSchema(this.validationSchema), async (req, res) => {
            try {
                await this.inicio(req, res, `adicionando ${this.nomeSingular}...`)

                const body = await this.gerarBodyAdd(req, res)

                const resultado = await this.DAO.add(body)
                res.status(201).json(resultado)

                this.fim(req, res)
            } catch (error) {
                this.errorHandler(error, req, res)
            }
        })
    }

    async gerarJSON(req, res, location, attrs, obligatory, allObligatory) {
        let o = {}

        const errors = []

        for (let i = 0; i < attrs.length; i++) {
            const attr = attrs[i]
            const value = req[location][attr]

            if(value === undefined && allObligatory){
                errors.push(await this.formatError(attr, value, "O valor deve ser informado.", location))
            }
            else if(value === null && obligatory && obligatory.includes(attr)){
                errors.push(await this.formatError(attr, value, "O valor não pode ser nulo.", location))
            }
            else if(value !== undefined){
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
        return this.gerarJSON(req, res, "query", this.attrsQuery)
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