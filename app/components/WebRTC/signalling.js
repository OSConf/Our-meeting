function Signaller(){
  var socket = io.connect('/manager');
  socket.on('error', function(err){
    console.log('socket error', err);
  });

  //list of events to trigger priority signalling
  var priorityEvents = {
    'waitForAck':true
  };
  //to determine when receiving the same event
  var priority = {};

	return {
    socket:socket,
    hs: handshake,
    priority: function(data){
      var userPriorities = priority[data.from];
      if(userPriorities){
        //data.priority is over written when response is sent back
        var pri = userPriorities[data.Status] - data.priority;
        delete priority[data.from];
        return pri;
      }
      return 1;
    },
		send: function(evt, data){
      console.log('sending signal', evt, data);
			socket.emit('signal', evt, data);
		},
		on: function(evt, callback){
			socket.on(evt, callback);
		},
    handshake: function(evt, data){
      if(priorityEvents[data.Status]){
        priority[data.to] = {};
        data.priority = priority[data.to][data.Status] = Date.now();
      }
      socket.emit('handshake', evt, data);
    }
	};
}

function handshake(timeout, signaller){
  /*
    Peers have 4 states as Status
    waiting -> not actively communicating
    receiver -> actively communicating, waiting to receive offer
    sender -> actively communicating, offer initiator
    complete -> not actively communicating, communications completed successfully
  */
  var hs = {};
  hs.waiting = function(){

  };

  hs.receiver = function(){

  };

  hs.sender = function(){

  };
  hs.complete = function(){

  };
  signaller.on('handshake', function(evt, data){
    console.log('evt recv', data.Status, data.from);
    var user = data.from;
    var peer = webrtc.getRTC(user);
    console.log('my status', peer.Status);
    if(peer.Status === undefined){
      signaller.emit('cancel', address(user, undefined));
      return;
    }

    if(evt === 'ack'){
      if((peer.Status === 'waiting' || peer.Status === 'blocked' || peer.Status === 'ready') && 
        data.Status === 'waitForAck'){
        
        //When receiving, the connection will wait for an offer
        peer.Status = 'receiving';
        signaller.handshake('ack', address(user, peer.Status));

      } else if(peer.Status === 'waitForAck' && 
        data.Status === 'receiving'){

        //The other side is ready to receive offer
        peer.checkForStream(function(){
          peer.offer();
        });
      
      } else if(peer.Status === 'waitForAck' &&
        data.Status === 'waitForAck'){

        //block for timeout
        var priority = signaller.priority(data);
        var reply = 'ack';
        if(priority > 0){
          peer.Status = 'receiving';
        }

        //If both are same priority, reset the connection
        signaller.handshake('ack', address(user, peer.Status));
      }
    } else if(evt === 'cancel'){
      peer.Status = 'waiting';
    }
  });
}
