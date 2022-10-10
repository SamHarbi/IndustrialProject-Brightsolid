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

//Code adapted from https://www.npmjs.com/package/express-session#compatible-session-stores user login example
/* GET users listing. */
router.get('/', isAuthenticated, function (req, res) {

    connection.query('SELECT * FROM resource WHERE account_id = ?', [req.session.accountID], (err, rows, fields) => {
        if (err) { //Query didn't run
            res.send('Something went wrong :(');
        }
        if (row.length < 1) {
            reject('No Resource Found');
        } else {

        }
    });

})

module.exports = router;
