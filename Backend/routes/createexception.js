/*
A Secured Route that takes a GET request and returns some HTML from the express-session documentation to print the user's name and id
Can be used to test if a session is active
*/
require('dotenv').config() //.env files for local testing

var express = require('express');
var session = require('express-session');
var escapeHtml = require('escape-html');
const dayjs = require('dayjs')
const mysql = require('mysql2');
var router = express.Router();

var customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)

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

                let lastUpdate = dayjs();
                lastUpdate = lastUpdate.format("YYYY-MM-DD hh:mm:ss");
                reviewDate = dayjs().add(req.body.addedTime, 'month');
                reviewDate = reviewDate.format("YYYY-MM-DD hh:mm:ss");

                connection.query('INSERT INTO exception (customer_id, rule_id, last_updated_by, exception_value, justification, resource_id, review_date, last_updated) VALUES ((SELECT customer_id FROM account WHERE account_id = ? ), ?, ?, (SELECT resource_name FROM resource WHERE resource_id = ?), ?, ?, ?, ?);', [req.session.accountID, req.body.ruleID, req.session.accountID, req.body.resourceID, req.body.justification, req.body.resourceID, reviewDate, lastUpdate], (err, row, fields) => {
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

function getNewExceptionData(req) {
    return new Promise((resolve, reject) => { //The customer should be banned from the service for DOS attacking if they send requests so fast that this somehow returns the wrong exception
        connection.query('SELECT * FROM exception WHERE exception_id IN (SELECT max(exception_id) FROM exception WHERE customer_id IN (SELECT customer_id FROM account WHERE account_id = ? ))', [req.session.accountID], (err, row, fields) => {
            if (err) { //Query didn't run
                reject(err);
            }
            else {
                resolve(row);
            }
        });
    });
}

function createAudit(req, exep) {
    return new Promise((resolve, reject) => { //First check that exception is not compliant and then delete it

        const que = ` INSERT INTO exception_audit
         (exception_id, user_id, customer_id, rule_id, action, action_dt, old_exception_value, new_exception_value, old_justification, new_justification, old_review_date, new_review_date) 
         VALUES (?, (SELECT user_id FROM user WHERE customer_id IN (SELECT customer_id FROM account WHERE account_id = ?)), (SELECT customer_id FROM account WHERE account_id = 1), 1, "CREATE", ?, ?, ?, ?, ?, ?) `

        let lastUpdate = dayjs();
        lastUpdate = lastUpdate.format("YYYY-MM-DD hh:mm:ss");
        reviewDate = dayjs().add(req.body.addedTime, 'month');
        reviewDate = reviewDate.format("YYYY-MM-DD hh:mm:ss");

        connection.query(que, [exep[0].exception_id, req.session.accountID, req.body.ruleID, lastUpdate, exep[0].justification, req.body.justification, reviewDate, reviewDate], (err, row, fields) => {
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

    var data = "Done";
    var exception = "";
    var exceptionData = [];
    var audit = "";

    try {
        exception = await createException(req);
    } catch (err) {
        data = "Error in Exception";
        console.log(err);
    }

    try {
        exceptionData = await getNewExceptionData(req);
    } catch (err) {
        data = "Error in getting Exception";
        console.log(err);
    }

    try {
        audit = await createAudit(req, exceptionData);
    } catch (err) {
        data = "Error in Audit";
        console.log(err);
    }

    return data;
}

/* POST listing. */
router.post('/', isAuthenticated, function (req, res) {
    processResults(req).then((data) => {
        res.json(data);
    })
})

module.exports = router;
