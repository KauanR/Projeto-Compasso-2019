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

        this.validationSchema = {
            id: {
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
            },
            limite: {
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
            },
            ordem: {
                in: ["query"],
                isIn: ["ASC", "DESC"],
                optional: {
                    options: {
                        nullable: true
                    }
                },
                errorMessage: "O valor deve ser ASC ou DESC."
            },
            ordenarPor: {
                in: ["query"],
                isIn: ["id"].concat(Object.keys(validationSchema)),
                optional: {
                    options: {
                        nullable: true
                    }
                },
                errorMessage: "O valor deve ser um atributo válido."
            }
        }

        this.validationSchemaWithoutNullChecker = {}

        Object.assign(this.validationSchemaWithoutNullChecker, this.validationSchema)

        Object.assign(this.validationSchemaWithoutNullChecker, this.gerarValidationSchema(validationSchema, true))

        Object.assign(this.validationSchema, this.gerarValidationSchema(validationSchema, false))

        if (!naoGerarTodasRotas) {
            this.gerarRotaBusca()
            this.gerarRotaDeleta()
            this.gerarRotaAtualiza()
            this.gerarRotaAdicionaUm()
        }
    }

    gerarValidationSchema(validationSchema, withoutNullChecker) {
        const copyWithoutNullChecker = JSON.parse(JSON.stringify(validationSchema))
        const keys = Object.keys(copyWithoutNullChecker)
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i]

            copyWithoutNullChecker[k].in = ["query", "body"]

            if (withoutNullChecker || copyWithoutNullChecker[k].optional) {
                copyWithoutNullChecker[k].optional = {
                    options: {
                        nullable: true
                    }
                }
            }
        }
        return copyWithoutNullChecker
    }

    gerarRotaBusca() {
        this.router.get(`/${this.nomePlural}`, checkSchema(this.validationSchemaWithoutNullChecker), async (req, res) => {
            try {
                await this.inicio(req, res, `buscando ${this.nomePlural}...`)

                const resultado = await this.DAO.get(req.query)
                res.status(200).json(resultado)

                this.fim(req, res)
            } catch (error) {
                this.errorHandler(error, req, res)
            }
        })
    }

    gerarRotaDeleta() {
        this.router.delete(`/${this.nomePlural}`, checkSchema(this.validationSchemaWithoutNullChecker), async (req, res) => {
            try {
                await this.inicio(req, res, `deletando ${this.nomePlural}...`)

                const resultado = await this.DAO.delete(req.query)
                res.status(202).json(resultado)

                this.fim(req, res)
            } catch (error) {
                this.errorHandler(error, req, res)
            }
        })
    }

    gerarRotaAtualiza() {
        this.router.post(`/${this.nomePlural}`, checkSchema(this.validationSchemaWithoutNullChecker), async (req, res) => {
            try {
                await this.inicio(req, res, `atualizando ${this.nomePlural}...`)

                const resultado = await this.DAO.update(req.body, req.query)
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

                const resultado = await this.DAO.add(req.body)
                res.status(201).json(resultado)

                this.fim(req, res)
            } catch (error) {
                this.errorHandler(error, req, res)
            }
        })
    }

    async errorHandler(erro, req, res) {
        if (erro.message.includes("Validation Errors.")) {
            res.status(400).json(validationResult(req))
        } else {
            console.log(erro)
            res.status(500).json(await this.formatError(undefined, undefined, "Erro no servidor"))
        }
        this.fim(req, res)
    }

    async formatError(param, value, msg, location) {
        const ef = {
            location,
            msg,
            param,
            value
        }
        const errors = [ef]

        return errors
    }

    async inicio(req, res, mensagem) {
        console.log(`request id: ${req.id} -> ${mensagem}`)
        if (validationResult(req).errors.length > 0) {
            throw new Error("Validation Errors.")
        }
    }

    async fim(req, res) {
        res.end()
        console.log(`request id: ${req.id} -> fim`)
    }

}