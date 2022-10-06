var express = require('express');
const mysql = require('mysql2');
var router = express.Router();

connectionSetup = require('../database.js');

/* GET users listing. */
router.post('/', function(req, res, next) {

//Setup DB Connection and Connect
connection = connectionSetup.databaseSetup();

connection.connect();
/*
  LOGIN TODO HERE
*/
connection.end();

res.send('respond with a resource');
});

module.exports = router;
