var express = require('express');
const mysql = require('mysql2');
const { setConnection } = require('../database.js');
var router = express.Router();

connection = require('../database.js');

/* GET users listing. */
router.get('/', function(req, res, next) {

connection = setConnection();
connection.connect();

connection.query('SELECT 1 + 1 AS solution', (err, rows, fields) => {
  if (err) {
    res.send('Something went wrong :(');
  }

  console.log('The solution is: ', rows[0].solution)
});

connection.end();

  res.send('Server responded :)');
});

module.exports = router;
