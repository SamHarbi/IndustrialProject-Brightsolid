require('dotenv').config() //.env files for local testing

var express = require('express');
const mysql = require('mysql2');
var router = express.Router();

connection = require('../database.js');

/* GET users listing. */
router.get('/', function (req, res, next) {

  //Setup DB Connection and Connect
  connection = connectionSetup.databaseSetup();

  connection.connect();

  connection.query('SELECT 1 + 1 AS solution', (err, rows, fields) => {
    if (err) { //Query didn't run
      res.send('Something went wrong :(');
    }
  });

  connection.end();

  const testData = {
    data: [["1", "Rule Name 1", "Compliance State 1"], ["2", "Rule Name 2", "Compliance State 2"], ["3", "Rule Name 3", "Compliance State 3"]]
  };

  //Query has run 
  res.json(testData);

});

module.exports = router;
