/*
An Open Route that takes a GET request and returns a JSON response with test data 
*/
require('dotenv').config() //.env files for local testing

var express = require('express');
const mysql = require('mysql2');
var router = express.Router();

//Setup Databse Connection
connectionSetup = require('../database.js');
connection = connectionSetup.databaseSetup();
connection.connect();

/* GET listing. */
router.get('/', function (req, res, next) {

  //trivial query to check connection
  connection.query('SELECT 1 + 1 AS solution', (err, rows, fields) => {
    if (err) { //Query didn't run
      res.send('Something went wrong :(');
    }
  });

  connection.end();

  const testData = [{ "id": "1", "ruleName": "Rule Name 1", "complianceState": "Compliance State 1" },
  { "id": "2", "ruleName": "Rule Name 2", "complianceState": "Compliance State 2" },
  { "id": "3", "ruleName": "Rule Name 3", "complianceState": "Compliance State 3" }];

  //Query has run 
  res.json(testData);

});

module.exports = router;
