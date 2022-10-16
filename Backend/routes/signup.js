/*
A Secured Route that takes a POST request to create a new customer record
*/
require('dotenv').config() //.env files for local testing

var express = require('express');
const mysql = require('mysql2/promise');
var crypto = require('crypto');
const bcrypt = require('bcrypt');
var router = express.Router();

connectionSetup = require('../database.js');

function HashPass(password) {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, 10).then(function (hash) {
            resolve(hash);
        });
    })
}

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

function checkCustomer(req) {
    return new Promise((resolve, reject) => {
        //Check if Customer already exists
        connection.query("SELECT * FROM customer WHERE customer_name = '?'", [req.body.username], function (err, results, fields) {
            if (err) { //Query didn't run
                reject(err)
            }
            else {
                resolve(results);
            }
        });
    });
}

async function processResults() {

    var password;
    var customerCheck = [];
    var customerCreate;
    var customerGet;
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
        return "2";
    }

    //Get newly made customer record
    try {
        customerGet = await checkCustomer(req);
    } catch (err) {
        return "3";
    }

    //Create User
    try {
        user = createUser(req, customerGet);
    } catch (err) {
        return "4";
    }

    data = "New Customer record and account made"
    return data;
}

/* POST listing. */
router.post('/', function (req, res, next) {
    processResults(req).then((data) => {
        res.json(data);
    })
});


module.exports = router;
