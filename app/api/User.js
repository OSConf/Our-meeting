//General User object
var User = function(username, id, name){
  this.username = username;
  this.id = id;
  this.name = name;
  this.stream = null;
  this.callbacks = [];
};

User.prototype.on = function(evt, callback){
  var e = {evt:evt, callback:callback};
  this.callbacks.push(e);
};

User.prototype.applyEvents = function(){
  var item = this.listenOn();
  var cb = this.callbacks;
  for(var i = 0; i < cb.length; i++){
    var evt = cb[i].evt;
    var callback = cb[i].callback;
    item.on(evt, callback);
  }
};

//Implemented in subclasses
User.prototype.listenOn = function(){};

/*
  Current user represents the current local user
  the webrtc prop is meant to be reset when joining new meetings
  use getStreamControls to access volume / video controls on the users streams
*/
var CurrentUser = function(username, id, name){
  User.call(this, username, id, name);
  this.webrtc = null;
};

CurrentUser.prototype = Object.create(User.prototype);
CurrentUser.prototype.constructor = CurrentUser;

//Creates a new webrtc object, when joining a meeting
//callbacks are the events set on the current webrtc object
CurrentUser.prototype.newWebRTC = function(WebRTC){
  if(this.webrtc !== null){
    delete this.webrtc;
  }

  this.webrtc = new WebRTC({
    webrtcConfig: {
      debug:false
    }
  });

  this.applyEvents();
  return this.webrtc;
};

CurrentUser.prototype.getWebRTC = function(){
  return this.webrtc || null;
};

CurrentUser.prototype.getStream = function(){
  this.stream = this.webrtc.getMyInfo().stream;
};

CurrentUser.prototype.getStreamControls = function(){
  if(this.stream){
    return this.webrtc.streamController;
  }
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

CurrentUser.prototype.listenOn = function(){
  return this.webrtc;
};
var AdminUser = function(username, id, name, Admin){
  CurrentUser.call(this, username, id, name);
  this.Admin = Admin;
};

AdminUser.prototype = Object.create(CurrentUser.prototype);
AdminUser.prototype.constructor = AdminUser;

AdminUser.prototype.createMeeting = function(userList, meetingID) {

  this.Admin.addMeeting(meetingID,
    // Success functio=
    function(data) {
      console.log('Meeting created with ID ' + data);
      OurMeeting.prototype.admin.inviteUsers(data, userList);
    },
    // Failure function
    function() {
      console.log('Failed to create meeting');
    }
  );
};

AdminUser.prototype.openMeetings = function(callback){
  callback = callback || function() {};

  this.Admin.getMeeting(undefined,
    // Success function
    function(data) {
      console.log('Meetings retrieved');
      console.log(data.meetings);
      callback(data.meetings);
    },
    // Failure function
    function() {
      console.log('Meetings retrieval failed');
    }
  );
};

AdminUser.prototype.getAllUsers= function(callback, userID){
  this.Admin.getUser(userID,
    // Success function
    function(data) {
      console.log('User(s) info retrieved');
      callback(data);
    },
    // Failure function
    function() {
      console.log('Failed to get user data');
    }
  );
};
AdminUser.prototype.inviteUsers = function(meetingID, userList){
  this.Admin.inviteUser(meetingID, userList,
    // Success function
    function() {
      console.log('Users ' + userList.toString() + ' invited to meeting ' + meetingID);
    },
    // Failure function
    function() {
      console.log('Failed to invite users');
  });
};

var Peers = function(username, id, name){
  User.call(this, username, id, name);
};

Peers.prototype = Object.create(User.prototype);
Peers.prototype.constructor = Peers;

Peers.prototype.setPCInfo = function(webrtc){
  if(this.id !== undefined && this.id !== null){
    this.pc = webrtc.getUser(this.id);
  }
};
Peers.prototype.getStream = function(webrtc){
  if(this.id === undefined || this.id === null){
    return null;
  } else if(this.stream === null || this.stream === undefined){
    this.stream = webrtc.getStream(this.id);
  }

  return this.stream;
};

Peers.prototype.listenOn = function(){
  return this.pc;
};

//Takes care of needing webrtc object, and getting additional user info
Peers.create = function(webrtc, callback){
  return function(username, id, name){
      var peer = new Peer(username, id, name);
      peer.setPCInfo(webrtc);
      if(typeof callback === 'function'){
        callback(peer);
      }
      return peer;
  };
};

//Creates a collection of peer objects
Peers.many = function(webrtc, peerids, callback){
  var create = Peers.create(webrtc, callback);
  return peerids.map(function(v){
    return create(null, v, null);
  });
};

var users = {
  'admin':AdminUser,
  'user':CurrentUser,
  'peer':Peers
};

module.exports = function(type){
  var args = Array.prototype.slice.call(arguments, 1);
  return new users[type].apply(undefined, args);
};
