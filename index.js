require('dotenv').config()

const app = require('./src/app/config/custom_express')

const porta = process.env.PORT
app.listen(porta, () => {
    console.log(`ouvindo na porta ${porta}`)
})
