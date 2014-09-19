//Define socket.io handlers here
module.exports = function(server){
	var io = require('socket.io')(server);

	io.on('connect', function(socket){
		console.log('Received new socket connection');
	});

	return io;
};