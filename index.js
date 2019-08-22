var express = require('express');
var app = express();

const mysql = require('mysql');
const connection = mysql.createConnection({
    host     : 'localhost',
    port     : 3306,
    user     : 'root',
    password : '123456789',
    database : 'mydb'
});


app.listen(3000, function() {
    console.log('Rodando na porta 3000');
});

connection.connect(function(err){
    if(err) {
        return console.log(err);
    }
    console.log('conectou!');
})