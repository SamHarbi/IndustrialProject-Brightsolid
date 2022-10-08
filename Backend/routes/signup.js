require('dotenv').config() //.env files for local testing

var express = require('express');
const mysql = require('mysql2/promise');

var passport = require('passport');
var LocalStrategy = require('passport-local');
var crypto = require('crypto');


var router = express.Router();

connectionSetup = require('../database.js');

//This Function takes heavy inspiration from https://stackoverflow.com/questions/61900412/how-is-nodes-crypto-pbkdf2-supposed-to-work
function HashPass(password, salt) {
    return new Promise((resolve, reject) => {
        crypto.pbkdf2(password, salt, 310000, 32, 'sha256', (err, hashedPassword) => {
            if (err) { reject(err); } else { resolve(hashedPassword); }
        })
    })
}


/* POST users listing. */
router.post('/', function (req, res, next) {

    let salt = crypto.randomBytes(32); //This would be better to run async

    HashPass(req.body.password, salt)
        .then((hashedPassword) => {
            //Setup DB Connection and Connect
            connection = connectionSetup.databaseSetup();
            connection.connect();

            connection.query('SELECT * FROM customer WHERE customer_name = ?', [req.body.username], function (err, results, fields) {
                if (err) { //Query didn't run
                    console.log("not good 1");
                    return res.send('Something went wrong :(');
                    console.log("Connection Closed");
                    connection.end();
                }

                if (results.length > 0) {
                    console.log("not good 2");
                    return res.send('User Already Exists');

                    console.log("Connection Closed");
                    connection.end();
                }

                console.log("I Should not be running unless it's all good above");

                connection.query('INSERT INTO customer (customer_name, password, salt) VALUES (?, ?, ?);', [req.body.username, hashedPassword, salt], function (err, results) {
                    if (err) { //Query didn't run
                        console.log(err);
                        return res.send('Something went wrong :(');

                        console.log("Connection Closed");
                        connection.end();
                    }
                    else {
                        console.log("All Good");
                        return res.send('User Created');

                        console.log("Connection Closed");
                        connection.end();
                    }
                });

            });

        });
});




//console.log(hashedPassword.toString('hex'));
//return hashedPassword;


//res.send(newUserCreate.toString('hex'));



module.exports = router;
