require('dotenv').config() //.env files for local testing

var express = require('express');
var session = require('express-session')
var escapeHtml = require('escape-html')
const mysql = require('mysql2');
var router = express.Router();

//Code adapted from https://www.npmjs.com/package/express-session user login example
/* GET users listing. */
router.get('/logout', function (req, res, next) {
    // logout logic
    req.session.user = null
    req.session.save(function (err) {
        if (err) next(err)

        req.session.regenerate(function (err) {
            if (err) next(err)
            res.redirect('/')
        })
    })
})

module.exports = router;
