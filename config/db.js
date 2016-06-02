var config=require('./config.js');
var mongoose = require('mongoose');

mongoose.connect(config.db);

var db = mongoose.connection;

module.exports=db;