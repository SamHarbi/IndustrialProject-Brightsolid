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

function getNonCompliantResources(req) {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM resource WHERE resource_id = ?;', [req.body.resource_id], (err, row, fields) => {
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
router.get('/', isAuthenticated, function (req, res) {
    getNonCompliantResources(req).then((data) => {
        res.json(data);
    })
})

module.exports = router;
