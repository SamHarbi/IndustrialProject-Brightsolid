var express = require('express');
const mysql = require('mysql2');
var router = express.Router();

import {connection} from '../database.js';

/* GET users listing. */
router.get('/', function(req, res, next) {

connection.connect();

connection.query('SELECT 1 + 1 AS solution', (err, rows, fields) => {
  if (err) throw err

  console.log('The solution is: ', rows[0].solution)
});

connection.end();

  res.send('respond with a resource');
});

module.exports = router;
