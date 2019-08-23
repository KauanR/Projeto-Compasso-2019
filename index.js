require('dotenv').config()

var app = require('./src/config/CustomExpress');
var connection = require('./src/database/Data');

connection.connect(function(err){
    if(err) {
        return console.log(err);
    }
    console.log('conectou!');
});

const porta = process.env.PORT
app.listen(porta, () => {
    console.log(`ouvindo na porta ${porta}`)
})
