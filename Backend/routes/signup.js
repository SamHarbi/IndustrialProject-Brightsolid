/*
A Secured Route that takes a POST request to create a new customer record
*/
require('dotenv').config() //.env files for local testing

//Imports
var express = require('express');
const mysql = require('mysql2/promise');
var crypto = require('crypto');
const bcrypt = require('bcrypt');
var router = express.Router();

//Setup Databse Connection
connectionSetup = require('../database.js');
connection = connectionSetup.databaseSetup();
connection.connect();

// middleware to test if authenticated - copied from https://www.npmjs.com/package/express-session user login example
function isAuthenticated(req, res, next) {
    if (req.session.user && req.session.roleID == 1) next()
    else res.redirect("https://brightsolid-monoserver-7q9js.ondigitalocean.app/login.html");
}

//Hash the input password
function HashPass(password) {
    return new Promise((resolve, reject) => {
        //number of salt rounds is 10
        bcrypt.hash(password, 10).then(function (hash) {
            resolve(hash);
        });
    })
}

//Create record in user of type auditor
function createUser(req, customer) {
    return new Promise((resolve, reject) => {
        connection.query('INSERT INTO user (user_name, role_id, customer_id) VALUES (?, ?, ?);', [req.body.username, 0, customer[0].customer_id], function (err, results) {
            if (err) { //Query didn't run
                reject(err);
            }
            else {
                resolve(results);
            }
        });
    })
}

//Create record in account
function createAccount(req, customer) {
    return new Promise((resolve, reject) => {

        let hash = 1 //Add an actual hash here if account ref is ever needed

        connection.query('INSERT INTO account (account_ref, platform_id, customer_id) VALUES (?, ?, ?);', [hash, 2, customer[0].customer_id], function (err, results) {
            if (err) { //Query didn't run
                reject(err);
            }
            else {
                resolve(results);
            }
        });
    })
}

//Create Customer record
function createCustomer(req, pass) {
    return new Promise((resolve, reject) => {
        connection.query('INSERT INTO customer (customer_name, password) VALUES (?, ?);', [req.body.username, pass.toString('hex')], function (err, results) {
            if (err) { //Query didn't run
                reject(err);
            }
            else {
                resolve(results);
            }
        });
    })
}

//Check if customer exists and get the record by finding the customer_name
function checkCustomer(req) {
    return new Promise((resolve, reject) => {
        //Check if Customer already exists
        connection.query("SELECT * FROM customer WHERE customer_name = ?", [req.body.username], function (err, results, fields) {
            if (err) { //Query didn't run
                reject(err)
            }
            else {
                resolve(results);
            }
        });
    });
}

//Run queries and create final response
async function processResults(req) {

    //Create arrays to be populated
    var password;
    var customerCheck = [];
    var customerCreate;
    var customerGet;
    var account;
    var user;
    var data;

    //Check if Customer already exists
    try {
        customerCheck = await checkCustomer(req)
        if (customerCheck.length > 0) {
            return "Customer already exists";
        }
    } catch (err) {
        return err;
    }

    //Hash password
    password = await HashPass(req.body.password);

    //Create Customer
    try {
        customerCreate = createCustomer(req, password);
    } catch (err) {
        return err;
    }

    //Get newly made customer record
    try {
        customerGet = await checkCustomer(req);
    } catch (err) {
        return err;
    }

    //Create User
    try {
        user = createUser(req, customerGet);
    } catch (err) {
        return err;
    }

    //Create Account
    try {
        user = createAccount(req, customerGet);
    } catch (err) {
        return err;
    }

    data = "New Customer record and account made"
    return data;
}

/* POST listing. */
router.post('/', isAuthenticated, function (req, res, next) {
    processResults(req).then((data) => {
        res.json(data);
    })
});


module.exports = router;
