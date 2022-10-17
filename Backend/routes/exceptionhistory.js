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

//Setup Databse Connection
connectionSetup = require('../database.js');
connection = connectionSetup.databaseSetup();
connection.connect();

// middleware to test if authenticated - copied from https://www.npmjs.com/package/express-session user login example
function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else res.redirect("https://brightsolid-monoserver-7q9js.ondigitalocean.app/login.html");
}

//Run queries and create final response
async function processResults(req) {

    //Create arrays to be populated
    var data = [];

    //Get Data from DB and upon an error add error data
    try {
        data = await getExceptionHistory(req);
    } catch (err) {
        console.log(err);
    }

    return data;

}

//Get all exception audits for a resource
function getExceptionHistory(req) {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM exception_audit WHERE exception_id IN (Select exception_id FROM exception WHERE resource_id = ?) AND rule_id = ?', [req.body.resource_id, req.body.ruleID], (err, row, fields) => {
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

/* GET users listing. */
router.post('/', isAuthenticated, function (req, res) {
    processResults(req).then((data) => {
        res.json(data);
    })
})

module.exports = router;
