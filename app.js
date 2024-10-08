const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const expressLayout =require('express-ejs-layouts')
const session= require('express-session');
const nocache= require('nocache');
const multer=require("./utils/multer");
require('dotenv').config();
 
const adminRouter = require('./routes/admin');
const usersRouter = require('./routes/users');

let db=require('./config/connection');
const { SsmlBreak } = require('twilio/lib/twiml/VoiceResponse');
const app = express(); 

// let user=req.session.user

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressLayout)
app.use(nocache());

app.use(session({resave:false, saveUninitialized:true, secret:"key", cookie:{maxAge:600000}}))

db.connect(function(err){
  if(err) console.log("Connection Error" + err);
  else console.log("Database connected to port 27017");
})

app.use('/admin', adminRouter);
app.use('/', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', {layout : "errorLayout"});
});

module.exports = app;
