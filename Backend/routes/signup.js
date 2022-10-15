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

function createUser(res) {
    connection.query('INSERT INTO user (user_name, role_id, customer_id) VALUES (?, ?, ?);', [req.body.username, 0, res.body.customer_id], function (err, results) {
        if (err) { //Query didn't run
            console.log(err);
            return res.send('Something went wrong :(');
            connection.end();
        }
        else {
            return res.send('User Created');
            connection.end();
        }
    });
}

/* POST listing. */
router.post('/', function (req, res, next) {

    HashPass(req.body.password)
        .then((hashedPassword) => {
            //Setup DB Connection and Connect
            connection = connectionSetup.databaseSetup();
            connection.connect();

            //Check if Customer already exists
            connection.query('SELECT * FROM customer WHERE customer_name = ?', [req.body.username], function (err, results, fields) {
                if (err) { //Query didn't run
                    return res.send('Something went wrong :(');
                    connection.end();
                }

                if (results.length > 0) {//Customer name taken
                    return res.send('User Already Exists');
                    connection.end();
                }

                //Insert customer into customer table
                connection.query('INSERT INTO customer (customer_name, password) VALUES (?, ?);', [req.body.username, hashedPassword.toString('hex')], function (err, results) {
                    if (err) { //Query didn't run
                        console.log(err);
                        return res.send('Something went wrong :(');
                        connection.end();
                    }
                    else {

                    }
                });
            });
        });
});

module.exports = router;
