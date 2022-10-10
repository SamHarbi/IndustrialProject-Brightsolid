require('dotenv').config() //.env files for local testing

var express = require('express');
const mysql = require('mysql2/promise');

var passport = require('passport');
var LocalStrategy = require('passport-local');
var crypto = require('crypto');
const bcrypt = require('bcrypt');


var router = express.Router();

connectionSetup = require('../database.js');

//This Function takes heavy inspiration from https://stackoverflow.com/questions/61900412/how-is-nodes-crypto-pbkdf2-supposed-to-work
function HashPass(password) {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, 10).then(function (hash) {
            resolve(hash);
        });
    })
}


/* POST users listing. */
router.post('/', function (req, res, next) {

    HashPass(req.body.password, salt)
        .then((hashedPassword) => {
            //Setup DB Connection and Connect
            connection = connectionSetup.databaseSetup();
            connection.connect();

            //Check if User already exists
            connection.query('SELECT * FROM customer WHERE customer_name = ?', [req.body.username], function (err, results, fields) {
                if (err) { //Query didn't run
                    return res.send('Something went wrong :(');
                    connection.end();
                }

                if (results.length > 0) {
                    return res.send('User Already Exists');
                    connection.end();
                }

                //Insert User into customer table
                connection.query('INSERT INTO customer (customer_name) VALUES (?);', [req.body.username, hashedPassword.toString('hex')], function (err, results) {
                    if (err) { //Query didn't run
                        console.log(err);
                        return res.send('Something went wrong :(');
                        connection.end();
                    }
                    else {
                        console.log("All Good with user creation");
                        return res.send('User Created');
                        connection.end();
                    }
                });
            });
        });
});

module.exports = router;
