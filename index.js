var app = require('./src/config/CustomExpress');
var connection = require('./src/config/Data');
var router = require('./src/app/router/Router');

connection.connect(function(err){
    if(err) {
        return console.log(err);
    }
    console.log('Conexão com o banco realizada!');
});

app.use('/', router);

app.listen(3000, function() {
    console.log('Rodando na porta 3000');
});
