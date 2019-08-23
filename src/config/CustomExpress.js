var express = require('express');
var app = express();
var bodyParser = require('body-parser');

// BODY PARSER - receber JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

module.exports = app;