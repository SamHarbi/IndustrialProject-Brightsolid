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

//rules that have resources that are not compliant for a given logged in user
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

//Rules that don't have resources that are not compliant for a given logged in user
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

async function processResults() {
    //Get Data from DB
    var nonCompliant = await getNonCompliantRules();
    var compliant = await getCompliantRules();

    //Define a new json response array
    var data = [];

    //Fill the array with non compliant rules and format the data
    for (let i = 0; i < nonCompliant.length; i++) {
        data.push({
            id: nonCompliant[i].rule_id,
            ruleName: nonCompliant[i].rule_name,
            complianceState: "Non-Compliant",
            complianceStateID: 0 //Makes it easier to figure out in the frontend for calculation 
        })
    }

    //Fill the array with compliant rules and format the data
    for (let i = 0; i < nonCompliant.length; i++) {
        data.push({
            id: nonCompliant[i].rule_id,
            ruleName: nonCompliant[i].rule_name,
            complianceState: "Compliant",
            complianceStateID: 1 //Makes it easier to figure out in the frontend for calculation 
        })
    }

    res.json(data);

}

//Code adapted from https://www.npmjs.com/package/express-session#compatible-session-stores user login example
/* GET users listing. */
router.get('/', isAuthenticated, function (req, res) {



});

module.exports = router;
