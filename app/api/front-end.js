// Load webrtc here
var webrtc = require('../components/WebRTC/peer');
var RTC = webrtc.RTC();
var signaller = RTC.transport;
var Admin = require('../components/admin/admin.js')(signaller);

module.exports = ourMeeting;

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

ourMeeting.prototype.meeting = function(){

};

/*{
  getMeeting: function(meetingID) {
    Admin.getMeeting(meetingID, function(data){
      console.log(data);
      //data is an object with properties: id, meetUsers, meetInvitees
      //if meetingID is not passed in, data is an array of meeting names
    });
  },
  invitedUsers: function(meetingID) {
    //should be on admin
  },
  connectedUsers: function(meetingID) {
    //list of current connected users
  },
  sendMessage: function(message, meetingID) {

  },
  retreiveMessages: function(meetingID) {

  }
};
*/

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
    return self.meeting(meetingID);
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

/*
  class meeting:
    room id
    connected users
*/