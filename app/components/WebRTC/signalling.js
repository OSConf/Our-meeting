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

  function address(to, from, dataObj){
    dataObj.to = to;
    dataObj.from = from;
    return dataObj;
  }

	return {
    socket:socket,
    hs: sync,
    address: address,
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
function sync(timeout, signaller){
  /*
    Peers have 4 states as Status
    waiting -> not actively communicating
    receiver -> actively communicating, waiting to receive offer
    sender -> actively communicating, offer initiator
    complete -> not actively communicating, communications completed successfully
  */
  console.log('in hs');
  var hs = {};
  var peers = {};
  hs.addPeer = function(id, rtc){
    rtc.SentOffer = false;
    peers[id] = rtc;
  };

  hs.removePeer = function(id){
    delete peers[id];
  };

  function getPeer(id){
    return peers[id];
  }
  function address(from, to, data){
    return signaller.address(to, from, { Status:data });
  }
  signaller.on('handshake', function(evt, data){
    console.log('evt recv', data.Status, data.from);
    var user = data.from;
    var me = data.to;
    var peer = getPeer(user);
    console.log('my status', peer.Status);

    if(peer.Status === undefined){
      signaller.emit('cancel', address(me, user, undefined));
      return;
    }

    if(evt === 'ack'){
      if(data.Status === 'receive' && peer.Status === 'sender'){
          //The other side is ready to receive offer
          console.log('matched init wrtc');
          if(!peer.SentOffer){
            peer.checkForStream(function(){
              peer.offer();
              peer.SentOffer = true;
            });
          }
      } else if(peer.Status === 'waiting'){
        
        if(data.Status === 'sender'){
          //When receiving, the connection will wait for an offer
          peer.Status = 'receive';
          signaller.handshake('ack', address(me, user, peer.Status));
        } 

      } else if(peer.Status === 'receive'){
        if(data.Status === 'sender'){
          signaller.handshake('ack', address(me, user, peer.Status)); 
        }
      }
    } else if(evt === 'cancel'){
      peer.Status = 'waiting';
    } else if(evt === 'query'){
      var message = address(me, user, peer.Status);
      message.expect = peer.Status === 'sender' ? 'receive': 'sender';
      signaller.handshake('answer-query', message);
    } else if(evt === 'answer-query'){
      peer.Retry = 0;
      peer.Status = data.expect;
      signaller.handshake('ack', address(me, user, peer.Status));
    }
  });
console.log(hs);
  return hs;
}

