function Signaller(){
  var socket = io.connect('/manager');
  socket.on('error', function(err){
    console.log('socket error', err);
  });

	return {
    socket:socket,
		send: function(evt, data){
      console.log('sending signal', evt, data);
			socket.emit('signal', evt, data);
		},
		on: function(evt, callback){
			socket.on(evt, callback);
		},
    handshake: function(evt, data){
      socket.emit('handshake', evt, data);
    }
	};
}
