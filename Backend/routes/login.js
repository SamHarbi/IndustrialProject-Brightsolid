/*
An Open route that allows customers to log into thier accounts and creates a session
*/
require('dotenv').config() //.env files for local testing

var express = require('express');
var session = require('express-session');
const mysql = require('mysql2/promise');
var crypto = require('crypto');
const bcrypt = require('bcrypt');
var router = express.Router();

connectionSetup = require('../database.js');

//Get hashed user password from db and compare to hashed input password
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
    });
  });
}

//Get the customer's ID based on input name from db
function getCustomerID(customerName) {
  return new Promise((resolve, reject) => {
    connection = connectionSetup.databaseSetup();
    connection.connect();

    connection.query("SELECT * FROM customer WHERE customer_name = ?;", [customerName], function (err, row, fields) {
      if (err) { reject(err); }
      if (row.length < 1) {
        reject(err);
      } else {
        resolve(row[0].customer_id);
      }
    });
  });
}

//Get account data for customer
function getAccountData(customerID) {
  return new Promise((resolve, reject) => {
    connection = connectionSetup.databaseSetup();
    connection.connect();

    connection.query("SELECT * FROM account WHERE customer_id = ?;", [customerID], function (err, row, fields) {
      if (err) { reject(err); }
      if (row.length < 1) {
        reject(err);
      } else {
        resolve(row[0]);
      }
    });
  });
}

//Get User data
function getUserData(customerID, accountID) {
  return new Promise((resolve, reject) => {
    connection.query("SELECT * FROM user WHERE customer_id = ? AND user_id = ?;", [customerID, accountID], function (err, row, fields) {
      if (err) { reject(err); }
      if (row.length < 1) {
        reject("Too long");
      } else {
        resolve(row[0]);
      }
    });
  });
}

// middleware to test if authenticated - copied from https://www.npmjs.com/package/express-session example login
function isAuthenticated(req, res, next) {
  if (req.session.user) next()
  else next('route')
}

async function processResults(req) {

  customerID = 0;
  accountData = [];
  userData = [];
  data = "https://brightsolid-monoserver-7q9js.ondigitalocean.app/login.html";

  try {
    customerID = await getCustomerID(req.body.username);
  } catch (err) {
    return data;
  }

  try {
    accountData = await getAccountData(customerID);
  } catch (err) {
    return data;
  }

  try {
    userData = await getUserData(accountData.customer_id, req.body.account);
  } catch (err) {
    return data;
  }

  //Save data into session
  req.session.accountID = accountData.account_id;
  req.session.roleID = userData.role_id;
  req.session.user = req.body.username;
  req.session.save(function (err) {
    if (err) { return next(err) }
    data = "https://brightsolid-monoserver-7q9js.ondigitalocean.app/"; //User has been logged in successfully
  }).then(() => { return data; })

  //return data;
}

/* POST listing. */
router.post('/', express.urlencoded({ extended: false }), function (req, res, next) {

  //Login User based on input data
  login(req.body.username, req.body.password).then((value) => {

    //Mentioned as best practice to regenerate session in documentation for express-session
    req.session.regenerate(function (err) {
      if (err) { next(err); }

      processResults(req).then((data) => {
        res.redirect(data);
      })

    }).catch((err) => { console.log(err); });
  }).catch((err) => { console.log(err); });


});

module.exports = router;
