var app = require('../../config/CustomExpress');
var express = require('express');
var KpiDao = require('../infra/kpi-dao');
var mysql = require('../../config/Data');


const router = express.Router();

router.get('/', (req, res) =>  res.json({ message: 'Funcionando!' }));


//Mostra todas as KPIs
router.get('/kpi', (req, res) => {
    
    mysql.query(
        "SELECT * FROM `mydb`.`KPIS`", 
        (err, rows) => {
            if(err) {
                console.log(err);
            }
            res.send(rows);
        }
    );
});

//Busca nas KPIs por ID
router.get('/kpi/:id', (req, res) => {

    mysql.query(
        "SELECT * FROM `mydb`.`KPIS` WHERE ID = ?",
        [req.params.id],
        (err, rows) => {
            if(err) {
                console.log(err);
            }
            res.send(rows);
        }
    )
});

//Adiciona nova KPI
router.post('/kpi', (req, res) => {
    console.log(req.body);
    const kpiDao = new KpiDao(mysql);

    kpiDao.adicionaKPI(req.body)
        .then(res.redirect('/'))
        .catch(erro => console.log(erro));
});

module.exports = router;