
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');
mongoose=require('mongoose');
User = mongoose.model('User');
wrap = require('co-express');

var app=require('../../index');


exports.profile=function(req,res){
	res.render('accounts/profile',{user:req.user});
};

exports.load = wrap(function* (req, res, next, _id) {
  const criteria = { _id };
  req.profile = yield User.load({ criteria });
  if (!req.profile) return next(new Error('User not found'));
  next();
});

/**
 * Create user
 */

exports.create = wrap(function* (req, res) {
  console.log(req.body);
  const user = new User(req.body);
  user.provider = 'local';
  yield user.save(function(err){
    if(err){
      console.log(err.errors[Object.keys(err.errors)[0]].message);
      req.flash('error',err.errors[Object.keys(err.errors)[0]].message);
      return res.redirect('/signup');
    }
  });
  req.logIn(user, function(err){
    console.log('Hi, BC');
    if (err) 
      req.flash('info', 'Sorry! We are not able to log you in!');
    else
      req.flash('notify','Welcome aboard!');
    return res.redirect('/');
  });
});

/**
 *  Show profile
 */

exports.show = function (req, res) {
  const user = req.profile;
  res.render('users/show', {
    title: user.name,
    user: user
  });
};

exports.signin=function(req,res){
 res.render('accounts/signin',{errors:req.flash('error')});
};

/**
 * Auth callback
 */

exports.authCallback = login;

/**
 * Show login form
 */

exports.login = function (req, res) {
  res.render('accounts/login', {
    title: 'Login'
  });
};

/**
 * Show sign up form
 */

exports.signup = function (req, res) {
  res.render('accounts/signup', {
    title: 'Sign up',
    user: new User(),
    errors:req.flash('error')
  });
};

/**
 * Logout
 */

exports.logout = function (req, res) {
  req.logout();
  res.redirect('/');
};

/**
 * Session
 */

exports.session = login;

/**
 * Login
 */

function login (req, res) {
  
  const redirectTo = req.session.returnTo? req.session.returnTo: '/';
  delete req.session.returnTo;
  req.flash('notify','Welcome aboard!');
  res.redirect(redirectTo);
}