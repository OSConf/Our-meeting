var client = io({url:'http://localhost'});
var webrtc = WebRTC();
var signaller = Signaller();
var RTC = RTC(webrtc, signaller);

var user = Math.floor(Math.random()*100);
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
  peer.Status = evt === 'new-user' ? 'waiting': 'ready';

  //timeout for how long to wait before reattempting connection
  var timeout = 3000;
  handshake(peer, timeout);
  checkIfReady(user);
}
checkConnections();

//Checks all rtc connections to see if they are up and ready
//for signalling, checks all users every 30 seconds
function checkConnections() {
  var users = webrtc.getAllUsers();
  console.log(users);
  users.forEach(function(username){
    checkIfReady(username);
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
    var localStream = webrtc.getMyInfo().stream;
    console.log('Checking', user);
    if( localStream !== null){
      //Check if rtc connection has a local stream attached
      if(peer.getLocalStreams().length < 1){
        peer.addStream(localStream);
      }

      //Check if rtc connection does not have a remote stream attached
      if(peer.getRemoteStreams().length < 1){
        console.log('send req for remote');
        
        //Let peer know we are ready to begin signalling
        signaller.send('ready', {
          from: webrtc.getMyInfo().id,
          to:user,
        });
        peer.ready = true;
        setTimeout(function(){
          if(user !== undefined || user !== null){
            checkIfReady(user);
          }
        }, 15000);
      } else {
        peer.processIce();
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

function handshake(peer, timeout){
  signaller.on('handshake', function(evt, data){
    if(peer.Status === undefined){
      signaller.emit('cancel');
    }

    if(evt === 'ack'){
      if((peer.Status === 'waiting' || peer.Status === 'blocked') && 
        data.Status === 'waitForAck'){
        
        //When receiving, the connection will wait for an offer
        peer.Status = 'receiving';
        signaller.handshake('ack', {Status:peer.Status});

      } else if(peer.Status === 'waitForAck' && 
        data.Status === 'receiving'){

        //The other side is ready to receive offer
        peer.offer();
      
      } else if(peer.Status === 'waitForAck' &&
        data.Status === 'waitForAck'){

        //block for timeout
        peer.Status = Math.floor(Math.random()*10) % 2 ? 'block':peer.Status;
        //If both are at set to waitForAck, reset the connection
        signaller.handshake('reset', {Status:peer.Status});

        setTimeout(function(){
          peer.Status = 'waiting';
        }, timeout);
      }
    } else if(evt === 'reset'){
      if(peer.Status === 'waitForAck'){
        signaller.handshake('ack', {Socket:peer.Status});
      } else if(peer.Status === 'waitForAck' && 
        data.Status === 'waitForAck'){

        //Reverse positions if other end is still waitForAck
        peer.Status = 'receiving';
        signaller.handshake('ack', {Status:peer.Status});
      }
    }
  });
}