require('dotenv').config() //.env files for local testing

var express = require('express');
var session = require('express-session')
var escapeHtml = require('escape-html')
const mysql = require('mysql2');
var router = express.Router();

// middleware to test if authenticated - copied from https://www.npmjs.com/package/express-session example login
function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else next('route')
}

//Code adapted from https://www.npmjs.com/package/express-session#compatible-session-stores user login example
/* GET users listing. */
router.get('/', isAuthenticated, function (req, res) {
    // this is only called when there is an authentication user due to isAuthenticated
    res.send('hello, ' + escapeHtml(req.session.user) + '!' +
        ' <a href="/logout">Logout</a>')
})

module.exports = router;
