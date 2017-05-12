var path = require('path'),
    rootPath = path.normalize(__dirname + '/..');

var config={
    root:rootPath,  
    db:"mongodb://localhost/chitthi"
};

module.exports = config;
