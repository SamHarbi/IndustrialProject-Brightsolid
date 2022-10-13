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

/*
    It is pretty clear that a non atomic commit kind of event can occur here that is why the frontend autofills all information on the 
    users behalf (gotten from the server beforehand through other routes) to ensure it is correct, the only item dependant on the user, 
    resource_ID is checked by trying to delete it. Information is not autofilled in the testexceptioncreate page
*/
function createException(req) {
    return new Promise((resolve, reject) => { //First check that exception is not compliant and then delete it
        connection.query('DELETE FROM non_compliance WHERE resource_id = ?;', [req.body.resourceID], (err, row, fields) => {
            if (err) { //Query didn't run
                reject(err);
            }
            else { //Then add exception
                connection.query('INSERT INTO exception (customer_id, rule_id, last_updated_by, exception_value, justification, resource_id) VALUES ((SELECT customer_id FROM account WHERE account_id = ? ), ?, ?, (SELECT resource_name FROM resource WHERE resource_id = ?), ?, ?);', [req.session.accountID, req.body.ruleID, req.session.accountID, req.body.resourceID, req.body.justification, req.body.resourceID], (err, row, fields) => {
                    if (err) { //Query didn't run
                        reject(err);
                    }
                    else {
                        resolve("Exception Created");
                    }
                });
            }
        });
    });
}

async function processResults(req) {
    try {
        var exception = await createException(req);
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
