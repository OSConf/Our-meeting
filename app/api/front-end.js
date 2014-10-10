// Load webrtc here
var webrtc = require('../components/WebRTC/peer');
var RTC = webrtc.RTC();
var signaller = RTC.transport;
var Admin = require('../components/admin/admin.js')(signaller);
var socket = RTC.transport.socket;

//var Streams = function() {};

var User = function(username, id) {
  this.username = username;
  this.id = id;
  this.streams = null;
};

var Meeting = function(meetingID){
  var meeting = {};

  Admin.getMeeting(meetingID, function(data){
    if(meetingID === data.id){
      meeting.id = meetingID;
      meeting.invitees = data.meetInvitees;
      meeting.users = WebRTC.getAllUsers();
    }
  });

  meeting.getID = function(){
    return this.meeting.id;
  };
  meeting.invitedUser = function(){
    return this.meeting.invitees;
  };
  meeting.connectedUsers = function(){
    return this.meeting.users;
  };

  return meeting;
};

var ourMeeting = function() {
  /* Statics */
};

ourMeeting.prototype.admin = {
  createMeeting: function(userList) {
    //callback = callback || function() {};

    Admin.addMeeting(undefined,
      // Success function
      function(data) {
        console.log('Meeting created with ID ' + data);
        ourMeeting.prototype.admin.inviteUsers(data, userList);
      },
      // Failure function
      function() {
        console.log('Failed to create meeting');
      }
    );
  },
  openMeetings: function(callback) {
    callback = callback || function() {};

    Admin.getMeeting(undefined,
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
  },
  findUser: function(userID, callback) {

    Admin.getUser(userID,
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
  },
  inviteUsers: function(meetingID, userList) {
    Admin.inviteUser(meetingID, userList,
      // Success function
      function() {
        console.log('Users ' + userList.toString() + ' invited to meeting ' + meetingID);
      },
      // Failure function
      function() {
        console.log('Failed to invite users');
      });
  },

  // Admin remove meeting function that attempts to remove the given meeting
  closeMeeting: function(meetingID) {
    Admin.removeMeeting(meetingID,
      // Success function
      function(data) {
        console.log('Meeting ' + meetingID + ' closed.');
        console.log(data);
      },
      // Failure function
      function() {
        console.log('Meeting ' + meetingID + ' failed to close. (May not exist)');
      }
    );
  }
};

ourMeeting.prototype.currentUser = function(username, id){ 
  var me = new User(username, id);
  var self = this;
  //should *always* listen for 'inviteList' to get list of rooms
  signaller.on('inviteList', function(data){
    //data = array of meeting names
    console.log(data);
  });
  //get method which create a users in this scope instansiate new CurrentUsers, occurs once
  me.joinMeeting = function(meetingID){
    RTC.start(null, function(err, streams){
      var elem = document.querySelector('#my-video > video');
      elem.hidden = false;
      attachMediaStream(elem, stream);
      me.streams = streams;
      signaller.send('join', {id: meetingID});
    });
    self.meeting = new Meeting(meetingID);
  };
  me.checkInvites = function(){
    signaller.send('check-invite');
  };
  me.name = me.username || me.id;
  me.getStreams = function(){
    return this.streams;
  };

  return me;
};

var user = Math.floor(Math.random()*25);
//register self
socket.on('connect', function(){
  socket.emit('user-ready', {username:user});
});
socket.on('new-peer', function(){
  console.log('new peer');
});
RTC.start(null, function(err, stream){
  var elem = document.querySelector('#my-video > video');
  elem.hidden = false;
  attachMediaStream(elem, stream);
  RTC.transport.socket.emit('join',{id:1234});
});

webrtc.onRemoteStream(function(stream, elem){
  console.log('Hello, a stream has been added <=============================');
  document.getElementById('userlist')
    .appendChild(elem);
});

module.exports = ourMeeting;