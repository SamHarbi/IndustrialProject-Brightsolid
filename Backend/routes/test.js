var express = require('express');
const mysql = require('mysql2');
var router = express.Router();

connection = require('../database.js');

/* GET users listing. */
router.get('/', function(req, res, next) {

//Setup DB Connection and Connect
connection = connectionSetup.databaseSetup();

connection.connect();

connection.query('SELECT 1 + 1 AS solution', (err, rows, fields) => { 
  if (err) { //Query didn't run
    res.send('Something went wrong :(');
  }
});

connection.end();

//Query has run 
res.send('Server responded :)');

});

module.exports = router;
