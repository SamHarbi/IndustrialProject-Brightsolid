/*
A Secured Route that takes a GET request and responds with a JSON containing all resources that are compliant
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

function createErrorData(data) {
    data.push({
        resource_id: "No Resources Found",
        resource_ref: "NA",
        account_id: "NA",
        resource_type_id: "NA",
        resource_name: "NA",
        last_updated: "NA"
    })
}

/* GET listing. */
router.get('/', isAuthenticated, function (req, res) {

    var returnData = [];

    connection.query('SELECT * FROM `resource` WHERE resource_id NOT IN (SELECT resource_id FROM non_compliance) AND account_id = ?; ', [req.session.accountID], (err, row, fields) => {
        if (err) { //Query didn't run
            createErrorData(returnData);
            res.json(returnData);
        }
        if (row.length < 1) {//No result from query
            createErrorData(returnData);
            res.json(returnData);
        } else {
            res.json(row);//Return result
        }
    });

})

module.exports = router;
