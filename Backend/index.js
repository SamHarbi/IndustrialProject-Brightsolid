var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mysql = require('mysql2');
var bodyParser = require('body-parser')
var session = require('express-session');

var indexRouter = require('./routes/index');
var loginRouter = require('./routes/login');
var signupRouter = require('./routes/signup');
var testRouter = require('./routes/testConn');
var userRouter = require('./routes/user');
var logoutRouter = require('./routes/logout');
var compliantresourcesRouter = require('./routes/compliantresources');
var noncompliantresourcesRouter = require('./routes/noncompliantresources');
var detailreportRouter = require('./routes/detailreport');
var summaryRouter = require('./routes/summary');
var createException = require('./routes/createexception');
var whoami = require('./routes/whoami');
var exceptionHistory = require('./routes/exceptionhistory');
var suspendException = require('./routes/suspendexception');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('trust proxy', 1) // trust first proxy

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))

app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/signup', signupRouter);
app.use('/testConn', testRouter);
app.use('/user', userRouter);
app.use('/logout', logoutRouter);
app.use('/compliantresources', compliantresourcesRouter);
app.use('/noncompliantresources', noncompliantresourcesRouter);
app.use('/detailreport', detailreportRouter);
app.use('/summary', summaryRouter);
app.use('/createexception', createException);
app.use('/whoami', whoami);
app.use('/exceptionhistory', exceptionHistory);
app.use('/suspendexception', suspendException);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
