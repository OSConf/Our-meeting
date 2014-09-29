// Load webrtc here
var webrtc = require('../components/WebRTC/webrtc');
var Admin = require('../components/admin/admin.js');
var RTC = webrtc.RTC();
var signaller = RTC.transport;

module.exports = ourMeeting;

var Streams = function() {};

var User = function() {};

var ourMeeting = function() {
  /* Statics */
};

ourMeeting.prototype.whiteboard = {
  insert: function() {

  }
};

ourMeeting.prototype.meeting = {
  getMeeting: function(meetingID) {

  },
  invitedUsers: function(meetingID) {

  },
  connectedUsers: function(meetingId) {

  },
  sendMessage: function(message, meetingID) {

  },
  retreiveMessages: function(meetingID) {

  }
};

ourMeeting.prototype.admin = {
  createMeeting: function() {

  },
  openMeetings: function() {

  },
  findUser: function(userID) {

  },
  closeMeeting: function(meetingID) {

  }
};

ourMeeting.prototype.currentUser = {
  joinMeeting: function(meetingID) {

  },
  checkInvites: function() {

  },
  name: 'name',
  getStreams: function() {

  },
  leaveMeeting: function(meetingID) {

  }
};
