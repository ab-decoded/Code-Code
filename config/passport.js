mongoose = require('mongoose');
User = mongoose.model('User');


// google = require('./passport/google');
// twitter = require('./passport/twitter');
local = require('./passport/local');
facebook = require('./passport/facebook');


module.exports = function (passport) {

  passport.serializeUser(function(user, cb){cb(null, user.id)});
  passport.deserializeUser(function(id, cb){User.load({ criteria: { _id: id } }, cb)});

  passport.use(local);
  passport.use(facebook);
  // passport.use(google);
  // passport.use(twitter);
};