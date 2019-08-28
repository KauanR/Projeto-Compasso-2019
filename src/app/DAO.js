const db = require("../config/Data")

const _ = require("lodash")

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
        delete json.group
        const colunas = Object.keys(json).join(',')

        const valores = Object.values(json)

        const placeholders = valores.map(() => '?').join(',')

        const sql = `INSERT INTO ${this.table} (${colunas}) VALUES (${placeholders})`
 
        return this.run(sql, valores)
    }

    async update(json, query) {
        const qr = JSON.parse(JSON.stringify(query))
        delete qr.limit
        delete qr.sort

        const colunas = Object.keys(json).join(',')

        const valores = Object.values(json)

        const colunasEPlaceholders = colunas.split(",").map(nome => `${nome} = ?`).join(",")

        const q = await this.gerarQuery(`UPDATE ${this.table} SET ${colunasEPlaceholders}`, qr)

        const valoresJSONeQuery = valores.concat(q.values)
        const sqlJSONeQuery = q.sql

        return this.run(sqlJSONeQuery, valoresJSONeQuery)
    }

    async gerarQuery(sql, query) {
        if (query) {
            const q = JSON.parse(JSON.stringify(query))

            let values = []

            const libOps = {
                $eq: "=",
                $dif: "!=",
                $ls: "<",
                $lse: "<=",
                $gr: ">",
                $gre: ">=",
                $in: "IN"
            }

            let sqlWhere = ""
            const keys = Object.keys(q)
            for (let i = 0; i < keys.length; i++) {
                const attrName = keys[i]
                if (attrName !== "sort" && attrName !== "limit") {
                    const attr = q[attrName]
                    let sqls = []

                    const keysAttr = Object.keys(attr)
                    for (let j = 0; j < keysAttr.length; j++) {
                        const k = keysAttr[j]

                        if (libOps[k] === "IN") {
                            values = values.concat(attr[k])
                            sqls.push(`${attrName} IN (${attr[k].map(v => "?").join(",")})`)
                        } else {
                            values.push(attr[k])
                            sqls.push(`${attrName} ${libOps[k]} ?`)
                        }
                    }

                    sqlWhere = `${sqlWhere} ${sqls.join(" AND ")}`
                }
            }
            if(sqlWhere.length > 0){
                sqlWhere = ` WHERE${sqlWhere}`
            }

            let sqlSort = ""
            if (q.sort) {
                sqlSort = ` ORDER BY ${q.sort.$by} ${_.toUpper(q.sort.$order)}`
            }

            let sqlLimit = ""
            if (q.limit) {
                values.push(q.limit.$offset)
                values.push(q.limit.$count)
                sqlLimit = ` LIMIT ?, ?`
            }

            return {
                sql: `${sql}${sqlWhere}${sqlSort}${sqlLimit}`,
                values
            }
        }
        return {
            sql,
            values: []
        }
    }

}