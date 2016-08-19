var express = require('express');
var engine=require('ejs-locals');

//middlewares
var favicon = require('serve-favicon');
var compress=require('compression');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var session = require('express-session');
var methodOverride = require('method-override');
var connectFlash = require('connect-flash');
var passport = require('passport');
var swig = require('swig');
var csrf=require('csurf');
var mongoStore = require('connect-mongo')(session);

var pkg = require('../package.json');

var env = process.env.NODE_ENV || 'development';

module.exports = function(app, config,router,passport) {

    swig.setDefaults({
        cache: false
    });

    app.use(compress());
    app.use(express.static(config.root + '/public'));
    app.set('port', config.port);
    app.set('views', config.root + '/app/views');
    app.engine('html',swig.renderFile);
    app.set('view engine', 'html');
    app.use(favicon(config.root + '/public/img/favicon.ico'));
    app.use(logger('dev'));
    app.use(bodyParser.urlencoded({extended:true}));
    app.use(bodyParser.json());
    app.use(methodOverride());

    // CookieParser should be above session
    app.use(cookieParser());
    app.use(cookieSession({ secret: pkg.name}));
    app.use(session({
        resave: true,
        saveUninitialized: true,
        secret: pkg.name,
        store: new mongoStore({
            url: config.db,
            collection : 'sessions'
        })
    }));

    app.use(csrf());

    // This could be moved to view-helpers :-)
    app.use(function (req, res, next) {
    // console.log(req.user);
    res.locals.csrf_token = req.csrfToken();
    next();
    });
    // use passport session
    app.use(passport.initialize());
    app.use(passport.session());

    
    //LOCALS SETUP
    app.use(function (req, res, next) {

      res.locals.baseUrl="http://localhost:3000/"
      res.locals.login = req.isAuthenticated();
      res.locals.user=req.user;
      if (env === 'development') {
        app.locals.pretty = true;
      }
      console.log(req.isAuthenticated());
      next();
    });


    app.use(connectFlash());
    app.use('/',router);
    app.use(function(req, res) {
      res.status(404).render('404', { title: '404' });
    });

    app.all('*', function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
      if (req.method == 'OPTIONS') {
        res.status(200).end();
      } else {
        next();
      }
    });



};
