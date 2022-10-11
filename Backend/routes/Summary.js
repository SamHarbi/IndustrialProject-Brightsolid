require('dotenv').config() //.env files for local testing

var express = require('express');
var session = require('express-session')
var escapeHtml = require('escape-html')
const mysql = require('mysql2');
const { json } = require('body-parser');
var router = express.Router();

// middleware to test if authenticated - copied from https://www.npmjs.com/package/express-session user login example
function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else next('/')
}

function getNonCompliantRules() {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM `rule` WHERE rule_id IN (SELECT rule_id FROM non_compliance WHERE resource_id IN (SELECT resource_id FROM resource WHERE account_id = ?));', [req.session.accountID], (err, row, fields) => {
            if (err) { //Query didn't run
                reject('Something went wrong :(');
            }
            if (row.length < 1) {
                reject('No Resource Found');
            } else {
                resolve(row);
            }
        });
    });
}

function getCompliantRules() {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM `rule` WHERE rule_id IN (SELECT rule_id FROM non_compliance WHERE resource_id IN (SELECT resource_id FROM resource WHERE account_id = ?));', [req.session.accountID], (err, row, fields) => {
            if (err) { //Query didn't run
                reject('Something went wrong :(');
            }
            if (row.length < 1) {
                reject('No Resource Found');
            } else {
                resolve(row);
            }
        });
    });
}

//Code adapted from https://www.npmjs.com/package/express-session#compatible-session-stores user login example
/* GET users listing. */
router.get('/', isAuthenticated, function (req, res) {

    getNonCompliant.then((result) => {
        getCompliant.then((result, result2) => {

            res.json(result + result2);

        }).catch((err) => { console.log(err); });
    }).catch((err) => { console.log(err); });

});

module.exports = router;
