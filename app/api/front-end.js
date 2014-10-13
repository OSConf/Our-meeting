// Load webrtc here
var WebRTC = require('om-webrtc');
var AdminFunctions = require('../components/admin/admin.js');

//Set when using new OurMeeting(signaller)
var signaller;
var Admin;
var webrtc = new WebRTC({
  webrtcConfig: {
    debug:false
  }
});

var User = function(username, id) {
  this.username = username;
  this.id = id;
};

var Meeting = function(meetingID){
  var meeting = {};

  Admin.getMeeting(meetingID, function(data){
    if(meetingID === data.id){
      meeting.id = meetingID;
      meeting.invitees = data.meetInvitees;
      meeting.users = webrtc.getAllUsers();
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
  meeting.getUser = function(id){
    return webrtc.getUser(id);
  };
  meeting.getStreams = function(){
    var streams = {};
    webrtc.getPeers().forEach(function(peer){
      streams[peer.id] = peer.streams;
    });
    return streams;
  };

  return meeting;
};

var OurMeeting = function() {
  /* Statics */
  this.on = function(evt, cb){
    webrtc.on(evt, cb);
  };

  //All users available in the subgroup
  this.users = [];

  Admin.getUser(null, function(users){
    this.users = users;
  }); 

  this.webrtc = function(){
    return webrtc;
  };
};

OurMeeting.prototype.admin = {
  createMeeting: function(userList, meetingID) {

    Admin.addMeeting(meetingID,
      // Success function
      function(data) {
        console.log('Meeting created with ID ' + data);
        OurMeeting.prototype.admin.inviteUsers(data, userList);
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
  getAllUsers: function(callback, userID) {
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

OurMeeting.prototype.currentUser = function(username, id){ 
  var me = new User(username, id);
  var self = this;
  me.invites = [];
  //should *always* listen for 'inviteList' to get list of rooms
  signaller.on('inviteList', function(data){
    console.log('Received invites');
    //data = array of meeting names
    me.invites = data;
  });
  //get method which create a users in this scope instansiate new CurrentUsers, occurs once
  me.joinMeeting = function(meetingID){
    webrtc.start(function(err, streams){
      signaller.send('join', {id: meetingID});
    });
    self.meeting = new Meeting(meetingID);
  };
  me.checkInvites = function(){
    signaller.send('check-invite');
  };
  me.name = me.username || me.id;
  me.getStreams = function(){
    return webrtc.getMyInfo().stream;
  };

  return me;
};

module.exports = function(signallingChannel){
  signaller = signallingChannel;
  Admin = new AdminFunctions(signallingChannel);
  return new OurMeeting();
};