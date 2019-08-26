var app = require('../../config/CustomExpress');
var express = require('express');
var KpiDao = require('../infra/kpi-dao');
var mysql = require('../../config/Data');

const KpiRouter = express.Router();

//Mostra todas as KPIs
KpiRouter.get('/', (req, res) => {
    
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
KpiRouter.get('/:id', (req, res) => {

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
KpiRouter.post('/adiciona', (req, res) => {

    console.log(req.body);
    const kpiDao = new KpiDao(mysql);

    kpiDao.adiciona(req.body)
        .then(res.redirect('/kpi'))
        .catch(erro => console.log(erro));
});


//Remove uma KPI
KpiRouter.delete('/remove/:id', (req, res) => {

    const id = req.params.id;
    const kpiDao = new KpiDao(mysql);

    kpiDao.remove(id)
        .then(() => res.status(200).end())
        .catch(erro => console.log(erro));
});


//Atualiza uma KPI
KpiRouter.put('/atualiza', (req, res) => {

    console.log(req.body);
    const kpiDao = new KpiDao(mysql);

    kpiDao.atualiza(req.body)
        .then(res.redirect('/kpi'))
        .catch(erro => console.log(erro));
});

module.exports = KpiRouter;