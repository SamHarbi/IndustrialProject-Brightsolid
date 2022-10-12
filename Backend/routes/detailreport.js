/*
A Secured Route that takes a GET request and responds with a JSON containing all resources that are not compliant
*/
require('dotenv').config() //.env files for local testing

var express = require('express');
var session = require('express-session')
var escapeHtml = require('escape-html')
const mysql = require('mysql2');
var router = express.Router();

connectionSetup = require('../database.js');
connection = connectionSetup.databaseSetup();

// middleware to test if authenticated - copied from https://www.npmjs.com/package/express-session user login example
function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else next('/')
}

function getNonCompliantResource(req) {
    return new Promise((resolve, reject) => {
        connection.connect();
        connection.query('SELECT * FROM resource WHERE resource_id IN (SELECT resource_id FROM non_compliance WHERE rule_id = ?) AND account_id = ?;', [req.body.id, req.session.accountID], (err, row, fields) => {
            if (err) { //Query didn't run
                console.log("Reject 1");
                reject('Something went wrong :(');
            }
            if (row.length < 1) {//No result from query
                console.log("Reject 2");
                reject('No Resource Found');
            } else {
                resolve(row); //Return result
            }
        });
    });
}

//SELECT * FROM `resource` WHERE resource_type_id IN (SELECT resource_type_id FROM rule WHERE rule_id NOT IN (SELECT rule_id FROM non_compliance WHERE rule_id NOT IN (SELECT rule_id FROM exception) ) AND rule_id = ?) AND account_id = ?; 
function getCompliantResource(req) {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM `resource` WHERE resource_type_id IN (SELECT resource_type_id FROM rule WHERE rule_id NOT IN (SELECT rule_id FROM non_compliance WHERE rule_id = ?)) AND account_id = ?;', [req.body.id, req.session.accountID], (err, row, fields) => {
            if (err) { //Query didn't run
                console.log("Reject 3");
                reject('Something went wrong :(');
            }
            if (row.length < 1) {//No result from query
                console.log("Reject 4");
                reject('No Resource Found');
            } else {
                resolve(row); //Return result
            }
        });
    });
}

function getException(req) {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM exception WHERE rule_id = ? AND customer_id IN (SELECT customer_id FROM account WHERE account_id = ?)', [req.body.id, req.session.accountID], (err, row, fields) => {
            if (err) { //Query didn't run
                console.log("Reject 5");
                reject('Something went wrong :(');
            }
            if (row.length < 1) {//No result from query
                console.log("Reject 6");
                reject('No Resource Found');
            } else {
                resolve(row); //Return result
            }
        });
    });
}

async function processResults(req) {

    var exception = [];

    //Get Data from DB
    try {
        var nonCompliant = await getNonCompliantResource(req);
        console.log("Reject 11");
        var compliant = await getCompliantResource(req);
        console.log("Reject 22");
        var exception = await getException(req);
        console.log("Reject 33");
    } catch (err) {
        exception.push({
            exception_value: "No Exceptions",
            justification: "-",
            review_date: "-",
            last_updated: "-",
            updatedby: "-"
        })
    }

    //Define a new json response array
    var data = [];

    //Fill the array with non compliant resources and format the data
    for (let i = 0; i < nonCompliant.length; i++) {
        data.push({
            id: (nonCompliant[i].resource_id).toString(),
            resource: nonCompliant[i].resource_name,
            complianceState: "Non-Compliant",
            complianceStateID: 0, //Makes it easier to figure out in the frontend for calculation 
            exception: "NA",
            justification: "NA",
            reviewdate: "NA",
            lastupdated: "NA",
            updatedby: "NA"
        })
    }

    //Fill the array with compliant resources and format the data
    for (let i = 0; i < compliant.length; i++) {
        data.push({
            id: (compliant[i].resource_id).toString(),
            ruleName: compliant[i].resource_name,
            complianceState: "Compliant",
            complianceStateID: 1, //Makes it easier to figure out in the frontend for calculation 
            exception: exception.exception_value,
            justification: exception.justification,
            reviewdate: exception.review_date,
            lastupdated: exception.last_updated,
            updatedby: exception.last_updated_by
        })
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
