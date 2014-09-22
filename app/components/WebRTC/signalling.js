function Signaller(socket){
	return {
		send: function(evt, data){
			socket.emit('signal', evt, data);
		},
		on: function(evt, callback){
			socket.on(evt, callback);
		}
	};
}
