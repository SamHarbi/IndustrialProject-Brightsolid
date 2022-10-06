const mysql = require('mysql2');

//Database Connection
const connection = mysql.createConnection({
    host: process.env.HOST,
    port: 25060,
    user: process.env.USERNAME,
    password: process.env.PASSWORD,
    database:  'defaultdb'
  });

