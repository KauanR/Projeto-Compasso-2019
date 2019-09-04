const db = require("../config/Data")

const _ = require("lodash")

module.exports = class DAO {
    constructor(table) {
        this.db = db
        this.table = table
        this.columns = []
        this.run(`SHOW COLUMNS FROM ${table}`).then(
            columns => this.columns = columns.map(c => c.Field)
        )
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
        let queryCopy = {}
        Object.assign(queryCopy, query)

        let valuesBuff = []

        let sqlSort = ""
        if (queryCopy.sort !== undefined && queryCopy.sort.$by !== undefined && queryCopy.sort.$order !== undefined) {
            sqlSort = `ORDER BY ${queryCopy.sort.$by} ${_.toUpper(queryCopy.sort.$order)}`
            delete queryCopy.sort
        }

        let sqlLimit = ""
        if (queryCopy.limit !== undefined && queryCopy.limit.$count !== undefined) {
            valuesBuff.push(queryCopy.limit.$count)
            sqlLimit = "LIMIT ?"

            if (queryCopy.limit.$offset !== undefined) {
                valuesBuff.push(queryCopy.limit.$offset)
                sqlLimit = "LIMIT ? OFFSET ?"
            }

            delete queryCopy.limit
        }

        let columns = []
        let columnsSQL = "*"
        if (queryCopy.except !== undefined) {
            for (let i = 0; i < this.columns.length; i++) {
                if (!queryCopy.except.includes(this.columns[i])) {
                    columns.push(this.columns[i])
                }
            }
            columnsSQL = columns.join(", ")
            delete queryCopy.except
        }

        const q = await this.gerarQuery(`SELECT ${columnsSQL} FROM ${this.table}`, queryCopy)

        q.sql = `${q.sql} ${sqlSort} ${sqlLimit}`
        q.values = q.values.concat(valuesBuff)

        return this.run(q.sql, q.values)
    }

    async delete(query) {
        const qr = JSON.parse(JSON.stringify(query))

        const limitBuff = qr.limit

        delete qr.limit
        delete qr.sort

        const sql = `DELETE FROM ${this.table}`

        const q = await this.gerarQuery(sql, qr)

        if (limitBuff !== undefined && limitBuff.$count !== undefined) {
            q.sql = `${q.sql} LIMIT ?`
            q.values.push(limitBuff.$count)
        }

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
        if (query !== undefined) {
            let q = JSON.parse(JSON.stringify(query))

            if (q.except !== undefined) {
                delete q.except
            }

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
            let sqls = []
            for (let i = 0; i < keys.length; i++) {
                const attrName = keys[i]
                const attr = q[attrName]

                const keysAttr = Object.keys(attr)
                for (let j = 0; j < keysAttr.length; j++) {
                    const k = keysAttr[j]

                    if (libOps[k] === "IN") {
                        values = values.concat(attr[k])
                        sqls.push(`${attrName} IN (${attr[k].map(() => "?").join(",")})`)
                    } else {
                        values.push(attr[k])
                        sqls.push(`${attrName} ${libOps[k]} ?`)
                    }
                }
            }

            if (sqls.length > 0) {
                sqlWhere = ` WHERE ${sqls.join(" AND ")}`
            }

            return {
                sql: `${sql}${sqlWhere}`,
                values
            }
        }
        return {
            sql,
            values: []
        }
    }

}
