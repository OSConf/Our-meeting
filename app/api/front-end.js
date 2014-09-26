(function(obj) {
  // Load webrtc here
  //var client = io({url:'http://localhost'});
  var webrtc = obj.ourMeeting.webrtc();
  var signaller = obj.ourMeeting.Signaller();
  var RTC = obj.ourMeeting.RTC(webrtc, signaller);

  var Streams = function() {};

  var User = function() {};

  obj.ourMeeting = function() {
    /* Statics */
  };

  obj.ourMeeting.prototype.whiteboard = {
    insert: function() {

    }
  };

  obj.ourMeeting.prototype.meeting = {
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

  obj.ourMeeting.prototype.admin = {
    createMeeting: function() {

    },
    openMeetings: function() {

    },
    findUser: function(userID) {

    },
    closeMeeting: function(meetingID) {

    }
  };

  obj.ourMeeting.prototype.currentUser = {
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
})(window);