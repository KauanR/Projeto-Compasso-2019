require('dotenv').config()

const app = require('./src/config/CustomExpress')

const porta = process.env.PORT
app.listen(porta, () => {
    console.log(`ouvindo na porta ${porta}`)
})
