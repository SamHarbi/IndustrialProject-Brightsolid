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

  //Query has run 
  res.json({
    0: {
      'id': 0,
      'ruleName': "Some Name 0",
      'complianceState': "Some State 0",
    },
    1: {
      'id': 1,
      'ruleName': "Some Name 1",
      'complianceState': "Some State 1",
    },
    2: {
      'id': 2,
      'ruleName': "Some Name 2",
      'complianceState': "Some State 2",
    }
  });

});

module.exports = router;
