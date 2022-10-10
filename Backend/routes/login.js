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

function getCustomerID(customerID) {
  return new Promise((resolve, reject) => {
    connection = connectionSetup.databaseSetup();
    connection.connect();

    connection.query("SELECT * FROM customer WHERE customer_name = ?;", [customerID], function (err, row, fields) {
      if (err) { reject(err); }
      if (row.length < 1) {
        reject('An Error Occured');
      } else {
        resolve(row);
      }
    });
  });
}

function getAccountData() {
  return new Promise((resolve, reject) => {
    connection = connectionSetup.databaseSetup();
    connection.connect();

    connection.query("SELECT * FROM account WHERE customer_id = ?;", [customerID], function (err, row, fields) {
      if (err) { reject(err); }
      if (row.length < 1) {
        reject('An Error Occured');
      } else {
        resolve(row);
      }
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
    req.session.regenerate(function (err) {
      if (err) { next(err); }

      var accountData;

      getCustomerID().then((result) => {
        getAccountData().then((result) => {
          accountData = result;
          console.log(result);
        })
      });



      req.session.user = req.body.username
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
