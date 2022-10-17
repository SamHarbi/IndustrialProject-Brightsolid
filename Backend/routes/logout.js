/*
An Open route that deletes all session data if any
*/
require('dotenv').config() //.env files for local testing

var express = require('express');
var session = require('express-session')
var escapeHtml = require('escape-html')
const mysql = require('mysql2');
var router = express.Router();

//Code adapted from https://www.npmjs.com/package/express-session user login example
/* GET listing. */
router.get('/', function (req, res, next) {
    // Wipe session by setting all saved values to null
    req.session.user = null
    req.session.accountID = null
    req.session.save(function (err) {
        if (err) next(err)

        req.session.regenerate(function (err) {
            if (err) next(err)
            res.redirect('/')
        })
    })
})

module.exports = router;
