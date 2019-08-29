var app = require('../../config/CustomExpress');
var express = require('express');
var CriteriaDao = require('../infra/criteria-dao');
var mysql = require('../../config/Data');

const CriteriaRouter = express.Router();

CriteriaRouter.get('/', (req, res) => {
    
    mysql.query(
        "SELECT * FROM `mydb`.`CRITERIA`", 
        (err, rows) => {
            if(err) {
                console.log(err);
            }
            res.send(rows);
        }
    );
});

CriteriaRouter.get('/:id', (req, res) => {

    mysql.query(
        "SELECT * FROM `mydb`.`CRITERIA` WHERE ID = ?",
        [req.params.id],
        (err, rows) => {
            if(err) {
                console.log(err);
            }
            res.send(rows);
        }
    )
});

CriteriaRouter.post('/adiciona', (req, res) => {

    console.log(req.body);
    const criteriaDao = new CriteriaDao(mysql);

    criteriaDao.adiciona(req.body)
        .then(res.redirect('/criteria'))
        .catch(erro => console.log(erro));
});

CriteriaRouter.delete('/remove/:id', (req, res) => {

    const id = req.params.id;
    const criteriaDao = new CriteriaDao(mysql);

    criteriaDao.remove(id)
        .then(() => res.status(200).end())
        .catch(erro => console.log(erro));
});

CriteriaRouter.put('/atualiza', (req, res) => {

    console.log(req.body);
    const criteriaDao = new CriteriaDao(mysql);
    
    criteriaDao.atualiza(req.body)
        .then(res.redirect('/criteria'))
        .catch(erro => console.log(erro));
});

module.exports = CriteriaRouter;