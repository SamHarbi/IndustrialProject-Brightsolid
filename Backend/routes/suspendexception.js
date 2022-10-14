/*
A Secured Route that takes a GET request and returns some HTML from the express-session documentation to print the user's name and id
Can be used to test if a session is active
*/
require('dotenv').config() //.env files for local testing

var express = require('express');
var session = require('express-session')
var escapeHtml = require('escape-html')
const mysql = require('mysql2');
var router = express.Router();

// middleware to test if authenticated - copied from https://www.npmjs.com/package/express-session user login example
function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else next('/')
}

//max(exception_id)
function getException(req) {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM exception WHERE exception_id IN (SELECT max(exception_id) FROM exception WHERE resource_id = ? AND rule_id = ? AND customer_id IN (SELECT customer_id FROM account WHERE account_id = ? ));', [req.body.resource_id, req.body.ruleID, req.body.accountID], (err, row, fields) => {
            if (err) { //Query didn't run
                reject('Something went wrong :(');
            }
            if (row.length < 1) { //No results from query
                reject('No Resource Found');
            } else {
                resolve(row); //return result
            }
        });
    });
}

function suspendException(exec) {
    return new Promise((resolve, reject) => {
        connection.query('UPDATE exception SET active = 0 WHERE exception_id = ?', [exec[0].exceptionID], (err, row, fields) => {
            if (err) { //Query didn't run
                reject('Something went wrong :(');
            }
            if (row.length < 1) { //No results from query
                reject('No Resource Found');
            } else {
                resolve("DONE"); //return result
            }
        });
    });
}

//Creates the audit using exception data gotten with the previous, getNewExceptionData in tandem with post data
function createAudit(req, exep) {
    return new Promise((resolve, reject) => {

        const que = ` INSERT INTO exception_audit
         (exception_id, user_id, customer_id, rule_id, action, action_dt, old_exception_value, new_exception_value, old_justification, new_justification, old_review_date, new_review_date, active) 
         VALUES (?, (SELECT user_id FROM user WHERE customer_id IN (SELECT customer_id FROM account WHERE account_id = ?)), (SELECT customer_id FROM account WHERE account_id = ?), ?, ?, ?, ?, ?, ?, ?, ?, ?, 0) `

        //Setup Time to be added
        let lastUpdate = dayjs();
        lastUpdate = lastUpdate.format("YYYY-MM-DD hh:mm:ss");

        ruleAction = "suspend";
        connection.query(que, [exep[0].exception_id, req.body.accountID, req.session.accountID, req.body.ruleID, ruleAction, lastUpdate, exep[0].new_exception_value, exep[0].exception_value, exep[0].new_justification, req.body.justification, exep[0].new_review_date, lastUpdate], (err, row, fields) => {
            if (err) { //Query didn't run
                reject(err);
            }
            else {
                resolve("Exception Created");
            }
        });

    });
}

async function processResults(req) {

    var exception = [];
    var suspend = "";
    var data = "";

    try {
        exception = await getException(req);
    } catch (err) {
        console.log(err);
    }

    try {
        suspend = await suspendException(exception);
    } catch (err) {
        console.log(err);
    }

    try {
        data = await suspendException(req, exception);
    } catch (err) {
        console.log(err);
    }

    return data;

}

/* GET users listing. */
router.post('/', isAuthenticated, function (req, res) {
    processResults(req).then((data) => {
        res.json(data);
    })
})

module.exports = router;
