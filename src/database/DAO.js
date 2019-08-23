const db = require("./Data")

module.exports = class DAO {
    constructor(table) {
        this.db = db
        this.table = table
    }

    async run(sql, values) {
        return new Promise((resolve, reject) => {
            this.db.query(sql, values, (error, results) => {
                if (error) {
                    reject(error)
                }
                resolve(results)
            })
        })
    }

    async get(query) {
        const q = await this.gerarQuery(`SELECT * FROM ${this.table}`, query)
        return this.run(q.sql, q.values)
    }

    async delete(query) {
        const q = await this.gerarQuery(`DELETE FROM ${this.table}`, query)
        return this.run(q.sql, q.values)
    }

    async add(json) {
        const colunas = Object.keys(json).join(',')

        const valores = Object.values(json)

        const placeholders = valores.map(() => '?').join(',')

        const sql = `INSERT INTO ${this.table} (${colunas}) VALUES (${placeholders})`

        return this.run(sql, valores)
    }

    async update(json, query) {
        const colunas = Object.keys(json).join(',')

        const valores = Object.values(json)

        const colunasEPlaceholders = colunas.split(",").map(nome => `${nome} = ?`).join(",")

        const q = await this.gerarQuery(`UPDATE ${this.table} SET ${colunasEPlaceholders}`, query)

        const valoresJSONeQuery = valores.concat(q.values)
        const sqlJSONeQuery = q.sql

        return this.run(sqlJSONeQuery, valoresJSONeQuery)
    }

    async gerarQuery(sql, query) {
        if (query) {
            const q = JSON.parse(JSON.stringify(query))
    
            let sqlOrdem = ""
            if (q.ordem && q.ordenarPor) {
                sqlOrdem = ` ORDER BY ${q.ordenarPor} ${q.ordem}`
                delete q.ordenarPor
                delete q.ordem
            }

            let sqlLimite = ""
            if (q.limite) {
                sqlLimite = ` LIMIT ${q.limite}`
                delete q.limite
            }

            let sqlWhere = ""
            const keys = Object.keys(q)
            if (keys.length > 0) {
                sqlWhere = ` WHERE ${keys.map(k => `${k} = ?`).join(" AND ")}`
            }

            return {
                sql: `${sql}${sqlWhere}${sqlOrdem}${sqlLimite}`,
                values: Object.values(q)
            }
        }
        return {
            sql,
            values: []
        }
    }

}