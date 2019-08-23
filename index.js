require('dotenv').config()

var app = require('./src/config/CustomExpress');
var connection = require('./src/config/Data');
var router = require('./src/app/router/Router');

connection.connect(function(err){
    if(err) {
        return console.log(err);
    }
    console.log('conectou!');
});

app.use('/', router);

const porta = process.env.PORT
app.listen(porta, () => {
    console.log(`ouvindo na porta ${porta}`)
})
