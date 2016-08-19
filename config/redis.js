var config=require('./config.js');
var redis = require("redis"),
    publisher = redis.createClient(config.redis.port,config.redis.host);

module.exports=publisher;