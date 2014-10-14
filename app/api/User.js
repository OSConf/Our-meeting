//General User object
var User = function(username, id, name){
  this.username = username;
  this.id = id;
  this.name = name;
  this.stream = null;
};

var CurrentUser = function(username, id, name){
  User.call(this, username, id, name);
  this.webrtc = null;
};

CurrentUser.prototype = Object.create(User.prototype);
CurrentUser.prototype.constructor = CurrentUser;

//Creates a new webrtc object, when joining a meeting
//callbacks are the events set on the current webrtc object
CurrentUser.prototype.newWebRTC = function(WebRTC){
  var callbacks;
  if(this.webrtc !== null){
    callbacks = this.webrtc.callbacks;
    delete this.webrtc;
  }

  this.webrtc = new WebRTC({
    webrtcConfig: {
      debug:false
    }
  });

  this.webrtc.callbacks = callbacks;
  return this.webrtc;
};

CurrentUser.prototype.getWebRTC = function(){
  return this.webrtc || null;
};

CurrentUser.prototype.getStream = function(){
  this.stream = this.webrtc.getMyInfo().stream;
};

//callback should return a meeting
CurrentUser.prototype.joinMeeting = function(signaller, meetingID, callback){
  if(this.streams === null){
    this.webrtc.start(function(err, streams){
      if(err){
        console.log(err);
      }

      signaller.send('join', {id: meetingID});
      this.stream = streams;
    });
  }
  this.meeting = callback(meetingID);
  return this.meeting;
};

CurrentUser.prototype.checkInvites = function(signaller){
  signaller.send('check-invites');
};

var AdminUser = function(username, id, name){
  CurrentUser.call(this, username, id, name);
};
AdminUser.prototype = Object.create(CurrentUser.prototype);
AdminUser.prototype.constructor = AdminUser;
AdminUser.prototype.getAllMeetings = function(){};



var Peers = function(username, id, name){
  User.call(this, username, id, name);

};
Peers.prototype = Object.create(User.prototype);
Peers.prototype.constructor = Peers;

var users = {
  'admin':AdminUser,
  'user':CurrentUser,
  'peer':Peers
};

module.exports = function(username, id, name, type){
  return new users[type](username, id, name, type);
};
