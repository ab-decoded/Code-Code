const app = require('../../index');
const mongoose = require('mongoose');
const crypto = require('crypto');
const Schema = mongoose.Schema;

oAuthTypes = [
  'twitter',
  'facebook',
  'google'
];

const userSchema = new Schema({
  name: { type: String, default: '' },
  email: { type: String, default: '' },
  username: { type: String, default: '' },
  provider: { type: String, default: '' },
  hashed_password: { type: String, default: '' },
  salt: { type: String, default: '' },
  authToken: { type: String, default: '' },
  facebook: {},
  twitter: {},
  google: {}
});

const validatePresenceOf = function(value){
    return value && value.length;
};

userSchema
  .virtual('password')
  .set(function (password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function () {
    return this._password;
  });

userSchema.path('name').validate(function (name) {
  if (this.skipValidation()) return true;
  return name.length;
}, 'Name cannot be blank');

userSchema.path('email').validate(function (email) {
  if (this.skipValidation()) return true;
  return email.length;
}, 'Email cannot be blank');

userSchema.path('email').validate(function (email, fn) {
  User = mongoose.model('User');
  if (this.skipValidation()) fn(true);

  // Check only when it is a new user or when email field is modified
  if (this.isNew || this.isModified('email')) {
    User.find({ email: email }).exec(function (err, users) {
      fn(!err && users.length === 0);
    });
  } else fn(true);
}, 'Email already exists');

userSchema.path('username').validate(function (username) {
  if (this.skipValidation()) return true;
  return username.length;
}, 'Username cannot be blank');

userSchema.path('hashed_password').validate(function (hashed_password) {
  if (this.skipValidation()) return true;
  return hashed_password.length && this._password.length;
}, 'Password cannot be blank');

userSchema.pre('save', function (next) {
  if (!this.isNew) return next();

  if (!validatePresenceOf(this.password) && !this.skipValidation()) {
    next(new Error('Invalid password'));
  } else {
    next();
  }
});



userSchema.methods = {

  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashed_password;
  },

  makeSalt: function () {
    return Math.round((new Date().valueOf() * Math.random())) + '';
  },

  encryptPassword: function (password) {
    if (!password) return '';
    try {
        return crypto.createHmac('sha1',this.salt).update(password).digest('hex');
        //return bcrypt.hashSync(password,bcrypt.genSaltSync(8),null);
    } catch (err) {
      return '';
    }
  },

  skipValidation: function () {
    return ~oAuthTypes.indexOf(this.provider);
  }
};


userSchema.statics = {

  load: function (options, cb) {
    options.select = options.select || 'name username';
    return this.findOne(options.criteria)
      .select(options.select)
      .exec(cb);
  }
};


mongoose.model('User',userSchema);