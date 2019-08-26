var app = require('./src/config/CustomExpress');
var connection = require('./src/config/Data');
var KpiRouter = require('./src/app/router/kpi-router');
var CriteriaRouter = require("./src/app/router/criteria-router")

connection.connect(function(err){
    if(err) {
        return console.log(err);
    }
    console.log('Conexão com o banco realizada!');
});

app.use('/kpi', KpiRouter);
app.use('/criteria', CriteriaRouter);

app.listen(3000, function() {
    console.log('Rodando na porta 3000');
});
