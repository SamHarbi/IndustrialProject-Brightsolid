require('dotenv').config() //remove on git bush

var express = require('express');
const mysql = require('mysql2');

var passport = require('passport');
var LocalStrategy = require('passport-local');
var crypto = require('crypto');

var router = express.Router();

connectionSetup = require('../database.js');

/* GET users listing. */
router.post('/', function(req, res, next) {

//Setup DB Connection and Connect
connection = connectionSetup.databaseSetup();

connection.connect();

//From the Passport.js Documentation
passport.use(new LocalStrategy(function verify(username, password, cb) {

  connection.query('SELECT * FROM users WHERE username = ?', (err, row, fields) => { 
    if (err) { res.send('Something went wrong :(');}
    if (!row) { res.send('Incorrect Username or Password'); }

    crypto.pbkdf2(password, row.salt, 310000, 32, 'sha256', function(err, hashedPassword) {
      if (err) { return cb(err); }
      if (!crypto.timingSafeEqual(row.hashed_password, hashedPassword)) {
        res.send('Incorrect Username or Password');
      }
      res.send('Logged in!');
    });
  });
}));

connection.end();

//res.send('respond with a resource');
});

module.exports = router;
