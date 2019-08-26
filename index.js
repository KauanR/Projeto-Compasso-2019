require('dotenv').config()

const app = require('./src/config/custom-express')

const porta = process.env.PORT
app.listen(porta, () => {
    console.log(`ouvindo na porta ${porta}`)
})

const DAO = require("./src/app/DAO")
const dao = new DAO("party")

async function testeGet(){
    dao.get({
        limit: {
            count: 10,
            offset: 1
        },
        sort: {
            by: "name",
            order: "asc"
        },
        id: {
            eq: 1,
            dif: 1,
            ls: 1,
            lse: 1,
            gr: 1,
            gre: 1,
            isIn: [1, 2, 3]
        }
    })
    .then(
        r => console.log(r),
        e => console.log(e)
    )
    .catch(
        err => console.log(err)
    )
}

testeGet()
