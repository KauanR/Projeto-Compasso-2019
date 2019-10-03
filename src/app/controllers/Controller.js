const express = require("express")

module.exports = class Controller {
    constructor(name){
        this.name = name
        this.router = express.Router()
    }
}