  var client = io.connect('localhost:9000/meeting');
  var webrtc = WebRTC();
  var signaller = Signaller(client);
  var rtc = RTC(webrtc, signaller);

  var user = Math.floor(Math.random()*100);
  var socket = signaller.socket;

  //register self
  socket.emit('user-ready', {username:user});
  socket.on('new-user', function(data){
    webrtc.addUser(data.username);
    rtc.newPeer(data.username);
  });

  function connect(){
    var users = webrtc.getUsurs;
    users.forEach(function(username){
      var peer = webrtc.getRTC(username);
      if(webrtc.getMyInfo().stream !== null){

      }
    });
  }
