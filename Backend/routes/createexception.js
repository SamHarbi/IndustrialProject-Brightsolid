/*
A Secured Route that takes a POST request and creates a new exception for a non compliant rule
*/
require('dotenv').config() //.env files for local testing

var express = require('express');
var session = require('express-session');
var escapeHtml = require('escape-html');
const dayjs = require('dayjs')
const mysql = require('mysql2');
var router = express.Router();

var customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

/*
This variable is essentially a simple security measure for a very very rare but possible edge case where 
an account pushes two exceptions at almost the same time in such a way that while the server is in the middle of executing the first and halfway executes the 
second one causing an audit to point to the wrong exception. See below for a pointer on where this happens
*/
let exceptionLock = 0;

// middleware to test if authenticated - copied from https://www.npmjs.com/package/express-session user login example
function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else next('/')
}

/*
    It is pretty clear that a non atomic commit kind of event can also (exceptionLock is not for this issue, look further below) occur here that is why the frontend autofills all information on the 
    users behalf (gotten from the server beforehand through other routes) to ensure it is correct, the only item dependant on the user, 
    resource_ID is checked by trying to delete it. Information is not autofilled in the testexceptioncreate page
*/
// This function creates the exception
function createException(req) {
    return new Promise((resolve, reject) => { //First check that exception is not compliant and then delete it

        if (exceptionLock == 1) {
            exceptionLock = 0;
            reject("LOCKED due to race condition");
        } else {
            exceptionLock = 1; //Locked
        }

        connection.query('DELETE FROM non_compliance WHERE resource_id = ? AND resource_id IN (SELECT resource_id FROM resource WHERE account_id = ?);', [req.body.resourceID], [req.body.accountID], (err, row, fields) => {
            if (err) { //Query didn't run
                reject(err);
            }
            else { //Then add exception

                //Setup Time to be added
                let lastUpdate = dayjs();
                lastUpdate = lastUpdate.format("YYYY-MM-DD hh:mm:ss");
                reviewDate = dayjs().add(req.body.addedTime, 'month');
                reviewDate = reviewDate.format("YYYY-MM-DD hh:mm:ss");

                connection.query('INSERT INTO exception (customer_id, rule_id, last_updated_by, exception_value, justification, resource_id, review_date, last_updated) VALUES ((SELECT customer_id FROM account WHERE account_id = ? ), ?, ?, (SELECT resource_name FROM resource WHERE resource_id = ?), ?, ?, ?, ?);', [req.body.accountID, req.body.ruleID, req.session.accountID, req.body.resourceID, req.body.justification, req.body.resourceID, reviewDate, lastUpdate], (err, row, fields) => {
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

/*
This is where exceptionLock comes into play to solve the issue mentioned above. createException() should never execute twice 
*/
//This function gets the exception that was most recently created for an account
function getNewExceptionData(req) {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM exception WHERE exception_id IN (SELECT max(exception_id) FROM exception WHERE customer_id IN (SELECT customer_id FROM account WHERE account_id = ? ))', [req.body.accountID], (err, row, fields) => {
            if (err) { //Query didn't run
                reject(err);
            }
            else {
                exceptionLock = 0; //Unlock 
                resolve(row);
            }
        });
    });
}

//Creates the audit using exception data gotten with the previous, getNewExceptionData in tandem with post data
function createAudit(req, exep) {
    return new Promise((resolve, reject) => {

        const que = ` INSERT INTO exception_audit
         (exception_id, user_id, customer_id, rule_id, action, action_dt, old_exception_value, new_exception_value, old_justification, new_justification, old_review_date, new_review_date) 
         VALUES (?, (SELECT user_id FROM user WHERE customer_id IN (SELECT customer_id FROM account WHERE account_id = ?)), (SELECT customer_id FROM account WHERE account_id = ?), ?, ?, ?, ?, ?, ?, ?, ?, ?) `

        //Setup Time to be added
        let lastUpdate = dayjs();
        lastUpdate = lastUpdate.format("YYYY-MM-DD hh:mm:ss");

        ruleAction = "create";

        connection.query(que, [exep[0].exception_id, req.body.accountID, req.session.accountID, req.body.ruleID, ruleAction, lastUpdate, exep[0].exception_value, exep[0].exception_value, exep[0].justification, req.body.justification, lastUpdate, lastUpdate], (err, row, fields) => {
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

    //Setup initial data
    var data = "Done";
    var exception = "";
    var exceptionData = [];
    var audit = "";

    try {
        console.log("START");
        exception = await createException(req);
        console.log("DONE 1");
    } catch (err) {
        data = "Error in Exception";
        console.log(err);
    }

    try {
        exceptionData = await getNewExceptionData(req);
        console.log("DONE 2");
    } catch (err) {
        data = "Error in getting Exception";
        console.log(err);
    }

    try {
        audit = await createAudit(req, exceptionData);
        console.log("DONE 3");
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
