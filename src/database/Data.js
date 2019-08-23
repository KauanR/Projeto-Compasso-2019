const mysql = require('mysql')

const connection = mysql.createConnection({
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    prot: process.env.DBPORT,
    password: process.env.DBPASSWORD,
    database: process.env.DBNAME
})

connection.connect((err) => {
    if (err) {
        console.log(`Erro ao conectar com o banco de dados: ${err.stack}`)

    } else {
        console.log(`Conectado com o banco de dados, threadID: ${connection.threadId}`)
    }
})

process.on('exit', () => {
    connection.end()
    console.log("A conexão com o banco de dados foi fechada.")
})

module.exports = connection