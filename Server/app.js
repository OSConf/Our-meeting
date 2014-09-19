var app = require('./config/routes');
var server = require('http').createServer(app);
var io = require('./config/io')(server);
var config = require('./config/config');

module.exports = {
  listen: function(){
  	server.listen(config.port, function(){
      console.log('listening on port:', config.port);
    });
  }
};