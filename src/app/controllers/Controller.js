const express = require("express")
const DAO = require("../../database/Data")
const { body, query } = require('express-validator')

module.exports = class Controller {
    constructor(nomeSingular, nomePlural, tabela, validationSchema, naoGerarTodasRotas) {
        this.router = express.Router()

        this.proxy = ``
        this.nomeSingular = nomeSingular
        this.nomePlural = nomePlural
        this.DAO = new DAO(tabela)

        this.validationSchema = validationSchema

        this.attrs = Object.keys(this.validationSchema)

        Object.assign(this.validationSchema, {
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
                isInt:{
                    options: {
                        min: 1
                    }
                },
                errorMessage: "O valor deve ser inteiro maior que 0."
            },
            ordem: {
                in: ["query"],
                inIn: ["ASC", "DESC"],
                errorMessage: "O valor deve ser ASC ou DESC."
            },
            ordenarPor: {
                in: ["query"],
                isIn: this.attrs,
                errorMessage: "O valor deve ser um atributo válido."
            }
        })

        this.validationSchemaWithoutNullChecker = this.gerarVSWNC()

        this.validationSchemaQuery = this.gerarVSWNC()

        if(!naoGerarTodasRotas){
            this.gerarRotaBusca()
            this.gerarRotaDeleta()
            this.gerarRotaAtualiza()
            this.gerarRotaAdicionaUm()
        }
    }

    gerarVSWNC(){
        const copyWithoutNullChecker = JSON.parse(JSON.stringify(this.validationSchema))
        const keys = Object.keys(copyWithoutNullChecker)
        for(let i = 0; i < keys.length; i++){
            const k = keys[i]
            if(copyWithoutNullChecker[k].exists){
                delete copyWithoutNullChecker[k].exists
            }
        }
        return copyWithoutNullChecker
    }

    gerarRotaBusca(){
        this.router.get(`${this.proxy}/${this.nomePlural}`, this.validacao.query, async (req, res) => {
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

    gerarRotaDeleta(){
        this.router.delete(`${this.proxy}/${this.nomePlural}`, this.validacao.query, async (req, res) => {
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

    gerarRotaAtualiza(){
        this.router.post(`${this.proxy}/${this.nomePlural}`, this.validacao.queryAndBody, async (req, res) => {
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
        this.router.post(`${this.proxy}/${this.nomePlural}/${this.nomeSingular}`, this.validacao.body, async (req, res) => {
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
        if (erro.menssage.includes("Validation Errors.")) {
            res.status(400).json(await req.validationErrors())
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
        console.log(`${mensagem}`)
        if(await req.validationErrors()){
            throw new Error("Validation Errors.")
        }
    }

    async fim(req, res) {
        res.end()
        console.log(`fim`)
    }

}