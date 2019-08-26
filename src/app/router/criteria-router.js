var app = require('../../config/CustomExpress');
var express = require('express');
var KpiDao = require('../infra/kpi-dao');
var mysql = require('../../config/Data');

const CriteriaRouter = express.Router();

module.exports = CriteriaRouter;