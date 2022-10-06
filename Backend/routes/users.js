var express = require('express');
const mysql = require('mysql');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {


//Database Connection
const connection = mysql.createConnection({
  host: process.env.HOST,
  port: 25060,
  user: process.env.USERNAME,
  password: process.env.PASSWORD,
  database:  'defaultdb'
});

connection.connect();

connection.query('SELECT 1 + 1 AS solution', (err, rows, fields) => {
  if (err) throw err

  console.log('The solution is: ', rows[0].solution)
});

connection.end();

  res.send('respond with a resource');
});

module.exports = router;
