mongoose = require('mongoose');
FacebookStrategy = require('passport-facebook').Strategy;
config = require('../config');
User = mongoose.model('User');

/**
 * Expose
 */

module.exports = new FacebookStrategy({
    clientID: config.facebook.clientID,
    clientSecret: config.facebook.clientSecret,
    callbackURL: config.facebook.callbackURL,
    profileFields: ['id', 'email', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified']
  },
  function (accessToken, refreshToken, profile, done) {
    options = {
      criteria: { 'facebook.id': profile.id }
    };
    console.log(profile.name.givenName+" "+profile.name.familyName);
    User.load(options, function (err, user) {
      if (err) return done(err);
      if (!user) {
        user = new User({
          name: profile.name.givenName+" "+profile.name.familyName,
          email: profile.emails[0].value,
          username: 'fb010_'+profile.name.givenName,
          provider: 'facebook',
          facebook: profile._json
        });
        user.save(function (err) {
          if (err) console.log(err);
          return done(err, user);
        });
      } else {
        return done(err, user);
      }
    });
  }
);