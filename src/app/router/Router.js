var app = require('../../config/CustomExpress');
var express = require('express');
var KpiDao = require('../infra/kpi-dao');
var mysql = require('../../config/Data');


const router = express.Router();




router.get('/', (req, res) =>  res.json({ message: 'Funcionando!' }));

router.post('/kpi', (req, res) => {
    console.log(req.body);
    const kpiDao = new KpiDao(mysql);

    kpiDao.adiciona(req.body)
        .then(res.redirect('/'))
        .catch(erro => console.log(erro));
});

module.exports = router;