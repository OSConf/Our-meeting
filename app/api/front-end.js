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

var ourMeeting = function(options) {
  /* Statics */
  this.whiteboardNode = options.whiteboard;
};

ourMeeting.prototype.whiteboard = {
  insert: function(node) {
    this.whiteboardNode.appendChild(node);
  }
};

ourMeeting.prototype.admin = {
  createMeeting: function() {
    var meetingID;

    Admin.addMeeting(undefined,
      // Success function
      function(data) {
        console.log('Meeting created with ID' + data.id); // or just data
        meetingID = data.id;
      },
      // Failure function
      function(data) {
        console.log(data);
        meetingID = this.createMeeting();
      }
    );

    return meetingID;
  },
  openMeetings: function() {
    var meetings;

    Admin.getMeeting(undefined,
      // Success function
      function(data) {
        console.log('Meetings retrieved');
        console.log(data);
        meetings = data;
      },
      // Failure function
      function(data) {
        console.log('Meetings retrieval failed');
        console.log(data);
      }
    );

    return meetings;
  },
  findUser: function(userID) { 
    var meetingList = Admin.getMeeting();

    var connectedMeetings = [];

    meetingList.forEach(function(meeting) {
      var users = meeting.connectedUsers();

      for (var i = 0; i < users.length; i++) {
        if (users[i].id === userID) {
          connectedMeetings.push(meeting);
        }
      }
    });

    return connectedMeetings;
  },

  // Admin remove meeting function that attempts to remove the given meeting
  closeMeeting: function(meetingID) {
    Admin.removeMeeting(meetingID,
      // Success function
      function(data) {
        console.log('Meeting ' + meetingID + 'closed.');
        console.log(data);
      },
      // Failure function
      function(data) {
        console.log('Meeting ' + meetingID + 'failed to close. (May not exist)');
        console.log(data);
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

module.exports = ourMeeting;