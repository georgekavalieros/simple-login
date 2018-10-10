const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const socket_io = require( "socket.io" );

let app = express();
let io = socket_io();
app.io = io;

let sess = {
    secret: 'secret',
    resave: true,
    saveUninitialized: true};


const index = require('./routes/index');
const register = require('./routes/register');
const login = require('./routes/login');
const verify = require('./routes/verify');
const profile = require('./routes/profile')(io);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(session(sess));
app.use('/', index);
app.use('/register', register);
app.use('/login', login);
app.use('/verify', verify);
app.use('/profile', profile);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;