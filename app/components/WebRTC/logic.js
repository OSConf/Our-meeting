var client = io({url:'http://localhost'});
var webrtc = ourMeeting.webrtc();
var signaller = Signaller();
var RTC = RTC(webrtc, signaller);

//timeout for how long to wait before reattempting connection
var timeout = 3000;

//Max communication retries before blocking 
var maxRetries = 10;

//handshake manager
var sync = signaller.hs(timeout, signaller);
console.log(sync);

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
  //handshake(timeout);
  
  data.forEach(function(user){
    addNew('users', user);
  });
});

function addNew(evt, user){

  //Add user to userlist
  if(webrtc.getUser(user) === undefined){
    webrtc.addUser(user);
  }

  //create RTCPeerConnection for user
  RTC.newPeer(user);

  //Prepare for handshake 
  var peer = webrtc.getRTC(user);

  //add peer to handshake man
  sync.addPeer(user, peer);

  if(evt === 'new-user'){
    peer.Status = 'receive'; 
  } else {
    peer.Status = 'sender';
    signaller.handshake('ack', signaller.address(
      user,
      webrtc.getMyInfo().id, {
        Status:peer.Status
      }
    ));
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

    if(peer.Status === 'waiting'){
      checkIfReady(username);
    }
  });
  setTimeout(function(){
    checkConnections();
  },60000);
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
        peer.Retry++;
        //If the peers status is synced, but has no remote streams,
        //Then it must no longer be synced
        signaller.handshake('ack', signaller.address(
          user,
          webrtc.getMyInfo().id, {
            Status:peer.Status
          }
        ));

        setTimeout(function(){
          if((user !== undefined || user !== null)){
            checkIfReady(user);
          }
        }, 15000);
      } else {
        peer.Status = 'synced';
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