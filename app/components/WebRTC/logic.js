var client = io({url:'http://localhost'});
var webrtc = require('./peer.js');
var rtc = webrtc.RTC();
var signaller = rtc.signaller;
var socket = rtc.transport.socket;

var user = Math.floor(Math.random()*25);
//register self
socket.on('connect', function(){
  socket.emit('user-ready', {username:user});
});
socket.on('new-peer', function(){
  console.log('new peer');
});
rtc.start(null, function(err, stream){
  rtc.transport.socket.emit('join',{id:1234});
});

webrtc.onRemoteStream(function(stream, elem){
  console.log('Hello, a stream has been added <=============================');
  document.getElementById('userlist')
    .appendChild(elem);
});

module.exports = webrtc;