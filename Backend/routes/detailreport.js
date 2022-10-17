/*
A Secured Route that takes a GET request and responds with a JSON containing all resources that are not compliant
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

function getNonCompliantResource(req) {
    return new Promise((resolve, reject) => {
        connection.connect();
        connection.query('SELECT * FROM resource WHERE resource_id IN (SELECT resource_id FROM non_compliance WHERE rule_id = ?) AND account_id = ?;', [req.body.id, req.session.accountID], (err, row, fields) => {
            if (err) { //Query didn't run
                reject('Something went wrong :(');
            }
            if (row.length < 1) {//No result from query
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
        connection.query('SELECT * FROM `resource` WHERE resource_id NOT IN (SELECT resource_id FROM non_compliance) AND resource_id NOT IN (SELECT resource_id FROM exception) AND resource_type_id IN (SELECT resource_type_id FROM rule WHERE rule_id = ?) AND account_id = ?; ', [req.body.id, req.session.accountID], (err, row, fields) => {
            if (err) { //Query didn't run
                reject('Something went wrong :(');
            }
            if (row.length < 1) {//No result from query
                reject('No Resource Found');
            } else {
                resolve(row); //Return result
            }
        });
    });
}

function getExceptionResources(req) {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM exception WHERE resource_id IN (SELECT resource_id FROM `resource` WHERE resource_id NOT IN (SELECT resource_id FROM non_compliance) AND resource_id IN (SELECT resource_id FROM exception) AND resource_type_id IN (SELECT resource_type_id FROM rule WHERE rule_id = ?) AND account_id = ?); ', [req.body.id, req.session.accountID], (err, row, fields) => {
            if (err) { //Query didn't run
                reject('Something went wrong :(');
            }
            if (row.length < 1) {//No result from query
                reject('No Resource Found');
            } else {
                resolve(row); //Return result
            }
        });
    });
}

async function processResults(req) {

    //Create arrays to be populated
    var exception = [];
    var nonCompliant = [];
    var compliant = [];

    //Get Data from DB and upon an error add error data
    try {
        var nonCompliant = await getNonCompliantResource(req);
    } catch (err) {
        console.log(err);
    }

    try {
        var compliant = await getCompliantResource(req);
    } catch (err) {
        console.log(err);
    }

    try {
        var exception = await getExceptionResources(req);
    } catch (err) {
        console.log(err);
    }

    //Define a new json response array
    var data = [];

    if (nonCompliant.length > 0) {
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
    }

    if (compliant.length > 0) {
        //Fill the array with compliant resources with no exception and format the data
        for (let i = 0; i < compliant.length; i++) {
            data.push({
                id: (compliant[i].resource_id).toString(),
                resource: compliant[i].resource_name,
                complianceState: "Compliant",
                complianceStateID: 0, //Makes it easier to figure out in the frontend for calculation 
                exception: "NA",
                justification: "NA",
                reviewdate: "NA",
                lastupdated: "NA",
                updatedby: "NA"
            })
        }
    }

    if (exception.length > 0) {
        //Fill the array with compliant resources that have an exception and format the data
        for (let i = 0; i < exception.length; i++) {
            data.push({
                id: (exception[i].resource_id).toString(),
                resource: exception[i].exception_value,
                complianceState: "Compliant",
                complianceStateID: 1, //Makes it easier to figure out in the frontend for calculation 
                exception: exception[i].exception_value,
                justification: exception[i].justification,
                reviewdate: exception[i].review_date,
                lastupdated: exception[i].last_updated,
                updatedby: exception[i].last_updated_by
            })
        }

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
