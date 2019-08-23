var app = require('../../config/CustomExpress');
var express = require('express');

const router = express.Router();

router.get('/', (req, res) =>  res.json({ message: 'Funcionando!' }));

module.exports = router;