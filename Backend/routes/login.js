require('dotenv').config() //.env files for local testing

var express = require('express');
const mysql = require('mysql2');

var passport = require('passport');
var LocalStrategy = require('passport-local');
var crypto = require('crypto');

var router = express.Router();

connectionSetup = require('../database.js');

//From the Passport.js Documentation
passport.use(new LocalStrategy(function verify(username, password, cb) {

  //Setup DB Connection and Connect
  connection = connectionSetup.databaseSetup();
  connection.connect();

  connection.query("SELECT * FROM customer WHERE customer_name = ?;", [username], function (err, row, fields) {
    if (err) { return cb(err); }
    if (!row) { return cb(null, false, { message: 'Incorrect username or password.' }); }

    console.log(row[0].salt);

    crypto.pbkdf2(password, row[0].salt, 310000, 32, 'sha256', function (err, hashedPassword) {
      if (err) { return cb(err); }
      hashedPassword = hashedPassword.toString('hex');
      if (!crypto.timingSafeEqual(Buffer.from(row[0].password, "utf-8"), Buffer.from(hashedPassword, "utf-8"))) {
        return cb(null, false, { message: 'Incorrect username or password.' });
      }
      return cb(null, row);
    });
  });
}));

/* POST users listing. */
router.post('/', passport.authenticate('local', {
  successRedirect: '/success',
  failureRedirect: '/fail'
}));

module.exports = router;
