var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config={
  development:{
    redis:{
      port:6379,
      host:'127.0.0.1'
    },
    port:3000,
    root:rootPath,
    db:"mongodb://localhost/chitthi",
    facebook:{
      clientID: '1572290126346581',
      clientSecret: '5ceba7c01e58eff7ca4f127b7232b24c',
      callbackURL: 'http://localhost:3000/auth/facebook/callback'
    }
    // google:{
    //   clientID: process.env.GOOGLE_CLIENTID,
    //   clientSecret: process.env.GOOGLE_SECRET,
    //   callbackURL: 'http://localhost:3000/auth/google/callback'
    // },
    // twitter:{
    //   clientID: process.env.TWITTER_CLIENTID,
    //   clientSecret: process.env.TWITTER_SECRET,
    //   callbackURL: 'http://localhost:3000/auth/twitter/callback'
    // }
  },
  test:{
    port:3000,
    root:rootPath
  },
  production:{
    port:3000,
    root:rootPath
  }
};

module.exports = config[env];
