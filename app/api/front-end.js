// Load webrtc here
var webrtc = require('../components/WebRTC/peer');
var RTC = webrtc.RTC();
var signaller = RTC.transport;
var Admin = require('../components/admin/admin.js')(signaller);
var socket = rtc.transport.socket;

var Streams = function() {};

var User = function(username, id) {
  this.username = username;
  this.id = id;
  this.streams = null;
};

var ourMeeting = function() {
  /* Statics */
};

ourMeeting.prototype.whiteboard = {
  insert: function() {

  }
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

ourMeeting.prototype.currentUser = function(username, id){
  var me = new User(username, id);
  var self = this;
  //should *always* listen for "inviteList" to get list of rooms
  signaller.on("inviteList", function(data){
    //data = array of meeting names
    console.log(data);
  });
  //get method which create a users in this scope instansiate new CurrentUsers, occurs once
  me.joinMeeting = function(meetingID){
    RTC.start(null, function(err, streams){
      me.streams = streams;
      signaller.send("join", {id: meetingID});
    });
    self.meeting = new Meeting(meetingID);
  };
  me.checkInvites = function(){
    signaller.send("check-invite");
  };
  me.name = me.username || me.id;
  me.getStreams = function(){
    return this.streams;
  };
  return me;
};

module.exports = ourMeeting;