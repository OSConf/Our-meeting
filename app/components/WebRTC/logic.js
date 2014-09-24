var client = io({url:'http://localhost'});
var webrtc = WebRTC();
var signaller = Signaller();
var RTC = RTC(webrtc, signaller);
var OMscope;
//timeout for how long to wait before reattempting connection
var timeout = 3000;

//Max communication retries before blocking 
var maxRetries = 10;

var store = sessionStorage.getItem('om-uid');
if(store === undefined || store === null){
  store = Math.floor(Math.random()*100);
  sessionStorage.setItem('om-uid', store);
}
var user = store;
webrtc.setId(user);
var socket = signaller.socket;
console.log(socket);
//register self
socket.on('connect', function(){
  socket.emit('user-ready', {username:user});
});


socket.on('new-user', function(data){
  console.log('received new peer');
  addNew('new-user', data.username);
});

socket.on('users', function(data){
  console.log(data);

  //performs negotiations to begin transferring description info
  handshake(timeout);
  
  data.forEach(function(user){
    addNew('users', user);
  });
});

function addNew(evt, user){

  //Add user to userlist
  webrtc.addUser(user);

  //create RTCPeerConnection for user
  RTC.newPeer(user);

  //Prepare for handshake 
  var peer = webrtc.getRTC(user);
  if(evt === 'new-user'){
    peer.Status = 'receiving'; 
  } else {
    peer.Status = 'waitForAck';
    signaller.handshake('ack', address(user, peer.Status));
  }
  peer.Retry = 0;

  checkIfReady(user);
}

setTimeout(function(){
  checkConnections();
}, 30000);

//Checks all rtc connections to see if they are up and ready
//for signalling, checks all users every 30 seconds
function checkConnections() {
  var users = webrtc.getAllUsers();
  console.log(users);
  users.forEach(function(username){
    var peer = webrtc.getRTC(username);

    if(peer.Status === 'waiting' ||
      peer.Status === 'connected'){
      checkIfReady(username);
      }
  });
  setTimeout(function(){
    checkConnections();
  },30000);
}

//Checks if an rtc stream has an attached local stream object, 
//local stream must attached before signalling can begin 
//Checks for remote stream, if one is present, no need for resignalling
function checkIfReady(user){
    var peer = webrtc.getRTC(user);
    //If there is no peer object, this user is probably self
    if(peer === undefined) return;

    var localStream = webrtc.getMyInfo().stream;
    console.log('Checking', user);

    if( localStream !== null){
      //Check if rtc connection has a local stream attached
      if(peer.getLocalStreams().length < 1){
        peer.addStream(localStream);
      }

      //Check if rtc connection does not have a remote stream attached
      if(peer.getRemoteStreams().length < 1){
        console.log(peer.Status);
        
        //If the peers status is connected, but has no remote streams,
        //Then it must no longer be connected
        if(peer.Status !== 'waitForAck' || peer.Status !== 'receiving'){
          peer.Status = 'waitForAck';
          signaller.handshake('ack', address(user, peer.Status));
        }

        setTimeout(function(){
          if((user !== undefined || user !== null)){
            console.log(peer.Status, 'Waiting on ', user);
            console.log('All users are', webrtc.getAllUsers());

            peer.Retry++;
            if(peer.Retry < maxRetries){
              checkIfReady(user);
            } else {
              peer.Status = 'block';
              peer.Retry = 0;
            }
          }
        }, 10000);
      } else {
        peer.Status = 'connected';
        console.log(peer.Status);
        return;
      }
      //Mark this peer as ready to begin signalling
      
    } else {
      console.log('No local stream');
      setTimeout(function(){
        if(user !== undefined || user !== null){
            checkIfReady(user);
        }
      }, 1000);
    }
  
}

function createVidElements(user){
  var stream = webrtc.getStream(user);
  var elem = toSrcElem(stream);
  return elem;
}

function getAllUserNames(){
  return webrtc.getAllUsers();
}
function address(user, status){
  return {
    from:webrtc.getMyInfo().id,
    to:user,
    Status:status
  };
}
function handshake(timeout){
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