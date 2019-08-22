var express = require('express');
var app = express();
var bodyParser = require('body-parser');


// SQL
const mysql = require('mysql');
const connection = mysql.createConnection({
    host     : 'localhost',
    port     : 3306,
    user     : 'root',
    password : 'password',
    database : 'mydb'
});
connection.connect(function(err){
    if(err) {
        return console.log(err);
    }
    console.log('conectou!');
});

// BODY PARSER - receber JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ROUTER
const router = express.Router();
router.get('/', (req, res) => res.json({ message: 'Funcionando!' }));
app.use('/', router);


app.listen(3000, function() {
    console.log('Rodando na porta 3000');
});
