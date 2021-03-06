var express = require('express'),
    router=express.Router(),
    fs = require('fs'),
    config = require('./config/config'),
   	passport = require('passport');

var modelsPath = __dirname + '/app/models';

fs.readdirSync(modelsPath).forEach(function (file) {
  if (file.indexOf('.js') >= 0) {
    require(modelsPath + '/' + file);
  }
});

var app = express();
var http=require('http').Server(app);

require('./config/express')(app, config,router,passport);
require('./config/passport')(passport);
require('./config/routes')(app,router,passport);
require('./config/socket')(http);
var db=require('./config/db');

db.once('open', function () {
  console.log("Connected to Database: "+config.db);
});
http.listen(config.port,function(){
	console.log('listening on port '+config.port);
});

module.exports=app;
