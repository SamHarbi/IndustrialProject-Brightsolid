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

function createException() {
    return new Promise((resolve, reject) => {
        connection.query('INSERT INTO exception (customer_id, rule_id, last_updated_by, exception_value, justification, resource_id) VALUES ((SELECT customer_id FROM account WHERE account_id = ? ), ?, ?, (SELECT resource_name FROM resource WHERE resource_id = ?), "Justification", "?");', [req.session.accountID, req.body.ruleID, req.session.accountID, req.body.resourceID, req.body.justification, req.body.resourceID], (err, row, fields) => {
            if (err) { //Query didn't run
                reject(err);
            }
            else {
                resolve("Exception Created");
            }
        });
    });
}

async function processResults() {
    try {
        var exception = await createException();
    } catch (err) {
        console.log(err);
    }

    var data = "Done";
    return data;
}

/* POST listing. */
router.post('/', isAuthenticated, function (req, res) {
    processResults(req).then((data) => {
        res.json(data);
    })
})

module.exports = router;
