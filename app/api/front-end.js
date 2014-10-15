// Load webrtc here
var WebRTC = require('om-webrtc');
var AdminFunctions = require('../components/admin/admin.js');
var UserClass = require('./User');

//Set when using new OurMeeting(signaller)
var signaller;
var Admin;

var User = function(username, id) {
  this.username = username;
  this.id = id;
};

var Meeting = function(meetingID, webrtc){
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
    this.user.on(evt, cb);
  };

  //All users available in the subgroup
  this.users = [];
  this.user = null;
  Admin.getUser(null, function(users){
    this.users = users;
  });

  this.webrtc = function(){
    if(this.user){
      return this.user.getWebRTC();
    }
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

OurMeeting.prototype.currentUser = function(username, id, name){
  var CurrentUser = UserClass('user');
  var me = new CurrentUser(username, id, name);
  me.newWebRTC(WebRTC);
  //should *always* listen for 'inviteList' to get list of rooms
  signaller.on('inviteList', function(data){
    console.log('Received invites');
    //data = array of meeting names
    me.invites = data;
  });

  //Sets up joinMeeting function with signaller and a way to create new meetings
  me.joinMeeting(signaller, WebRTC, function(meetingID){
    return new Meeting(meetingID, me.getWebRTC());
  });

  me.checkInvites(function(){
    signaller.send('check-invite');
  });

  return me;
};

module.exports = function(signallingChannel){
  signaller = signallingChannel;
  Admin = new AdminFunctions(signallingChannel);
  return new OurMeeting();
};
