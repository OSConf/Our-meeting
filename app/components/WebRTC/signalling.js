function Signaller(){
  var socket = io.connect('/manager');
  socket.on('error', function(err){
    console.log('socket error', err);
  });

	return {
    socket: socket,
		send: function(){
      var args = Array.prototype.slice.call(arguments);
      socket.emit.apply(socket, args);
    },
		receive: function(evt, callback){
			socket.on(evt, callback);
		},
    on: function(evt, callback){
      socket.on(evt, callback);
    },
    off: function(evt){
      socket.off(evt);
    }
	};
}

module.exports = Signaller;