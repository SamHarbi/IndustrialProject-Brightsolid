require('dotenv').config() //.env files for local testing

var express = require('express');
var session = require('express-session');
const mysql = require('mysql2/promise');

var passport = require('passport');
var LocalStrategy = require('passport-local');
var crypto = require('crypto');

const bcrypt = require('bcrypt');

var router = express.Router();

connectionSetup = require('../database.js');

function login(username, password) {

  return new Promise((resolve, reject) => {
    connection = connectionSetup.databaseSetup();
    connection.connect();

    connection.query("SELECT * FROM customer WHERE customer_name = ?;", [username], function (err, row, fields) {
      if (err) { reject(err); }
      if (row.length < 1) {
        reject('Incorrect username or password 1');
      } else {
        bcrypt.compare(password, row[0].password, function (err, result) {
          if (result == true) { resolve("Logged in"); } else { reject("Not Same"); }
        });
      }
      //console.log(row[0].salt);
    });
  });
}

// middleware to test if authenticated - copied from https://www.npmjs.com/package/express-session example login
function isAuthenticated(req, res, next) {
  if (req.session.user) next()
  else next('route')
}

/* POST users listing. */
router.post('/', express.urlencoded({ extended: false }), function (req, res, next) {
  login(req.body.username, req.body.password).then((value) => {
    console.log(value);
    req.session.regenerate(function (err) {
      if (err) { next(err); }
      req.session.user = req.body.user
      req.session.save(function (err) {
        if (err) { return next(err) }
        res.send("Done");
      })
    })
  }).catch(function (err) {
    console.log(err);
    res.send("Error")
  });
});

module.exports = router;
