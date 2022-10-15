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
        reject('An Error Occured 1');
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
        reject('An Error Occured 2');
      } else {
        resolve(row[0]); //Add multi account support 
      }
    });
  });
}

// middleware to test if authenticated - copied from https://www.npmjs.com/package/express-session example login
function isAuthenticated(req, res, next) {
  if (req.session.user) next()
  else next('route')
}

/* POST listing. */
router.post('/', express.urlencoded({ extended: false }), function (req, res, next) {

  //Login User based on input data
  login(req.body.username, req.body.password).then((value) => {

    //Mentioned as best practice to regenerate session in documentation for express-session
    req.session.regenerate(function (err) {
      if (err) { next(err); }

      //Get customer ID then use it to get account data 
      getCustomerID(req.body.username).then((result) => {
        getAccountData(result).then((result2) => {

          //Save data into session
          accountData = result2;
          req.session.accountID = result2.account_id;
          req.session.user = req.body.username;
          req.session.save(function (err) {
            if (err) { return next(err) }
            res.redirect("https://brightsolid-monoserver-7q9js.ondigitalocean.app/"); //User has been logged in successfully
          })
        })
      }).catch(function (err) {
        console.log(err);
        res.send("Error") //Something went wrong with login
      });

    }).catch((err) => { console.log(err); });
  }).catch((err) => { console.log(err); });


});

module.exports = router;
