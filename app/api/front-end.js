var ourMeeting = (function() {
  // Load webrtc here
  var webrtc = (function() {})();

  var Streams = function() {};

  var User = function() {};

  var om = function() {
    /* Statics */
  };

  om.prototype.whiteboard = {
    insert: function() {

    }
  };

  om.prototype.meeting = {
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

  om.prototype.admin = {
    createMeeting: function() {

    },
    openMeetings: function() {

    },
    findUser: function(userID) {

    },
    closeMeeting: function(meetingID) {

    }
  };

  om.prototype.currentUser = {
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


  return om;
})();