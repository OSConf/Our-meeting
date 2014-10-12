var _ = require('lodash');

var MeetingManager = function(){
  //holds our meetings and users
  this.meetings = {};
  this.users = {};
  this.socketIds = {};
  this.invitees = {};
};

var Meeting = function(id){
  this.id = id;
  this.meetUsers = [];
  this.meetInvitees = [];
};

//ability to add meetings
MeetingManager.prototype.addMeeting = function(id){
  var meetings = this.meetings;
  //randomizing helper function
  var randomize = function(meetings) {
    var random = Math.round( Math.random()*1000 );
    if( meetings[random] ){
      return randomize(meetings);
    } else {
      return random;
    }
  };
  //if id is not passed in, will creating a random id that does not already exist
  if(id === undefined || id === null){
    id = randomize(meetings);
  }
  //if id that is passed in already exist, will error
  if(meetings[id]){
    throw Error('Meeting already exist');
  } else {
    meetings[id] = new Meeting(id);
    return id;
  }
};

//ability to remove a meeting and delete the users from the invitees list
MeetingManager.prototype.removeMeeting = function(id){
  //grab all invited users to this meetings
  var meetingUsers = this.meetings[id].meetInvitees.slice();
  var that = this;
  //if this meeting exist
  if( this.meetings[id] ){
    _.each(meetingUsers, function(user){
      //will delete this meeting from user's invite list
      _.pull(that.invitees[user], id);
      //will delete the user from the invitees if they have no other invited meetings
      if(that.invitees[user].length === 0){
        delete that.invitees[user];
      }
    });
    //delete the meeting
    delete that.meetings[id];
    this.alertInvite(meetingUsers);
    return id;
  } else {
    throw Error('Meeting does not exist');
  }
};

//ability to get all meetings or just one specific meeting
MeetingManager.prototype.getMeeting = function(id){
  //if id is not passed in, return all meetings
  if(id === undefined || id === null){
    var meetings = Object.keys(this.meetings);
    return { meetings: meetings };
  } else {
    //if meeting does not exist, throw error
    if(!this.meetings[id]){
      throw Error("Meeting not found");
    //else, return the meeting
    } else {
      return this.meetings[id];
    }
  }
};

//when a user joins a meeting, they will be added to the meeting user list
MeetingManager.prototype.joinMeeting = function(meetingID, socketID){
  var username = this.socketIds[socketID];
  this.meetings[meetingID].meetUsers = _.union(this.meetings[meetingID].meetUsers, [username]);
};

//ability to grab current active user list for the meeting
MeetingManager.prototype.getMeetingList = function(meetingID){
  return this.meetings[meetingID].meetUsers;
};

//ability to add a user with a reference to the socket
MeetingManager.prototype.addUser = function(username, socket){
  this.users[username] = socket;
  this.socketIds[socket.id] = username;
};

//ability to get all users or just one specific user
MeetingManager.prototype.getUser = function(username){
  //if username is not passed in, return all users
  if(username === undefined || username === null){
    return Object.keys(this.users);
  } else {
    //if username does not exist, throw error
    if(this.users[username] === undefined){
      throw Error('User not found');
    //else, return the socket reference for the username
    } else {
      return this.users[username];
    }
  }
};

MeetingManager.prototype.getBySocketId = function(id){
  console.log(this.socketIds);
  if(id === undefined || id === null){
    return Object.keys(this.socketIds);
  } else {
    if(this.socketIds[id] === undefined){
      throw Error('Socket ID not found');
    } else {
      return this.socketIds[id];
    }
  }
};

//takes in meeting and an array of users  ex. usernames = ["john", "tom"]
MeetingManager.prototype.addUserToMeeting = function(meetingID, usernames){
  this.meetings[meetingID].meetInvitees = _.union(this.meetings[meetingID].meetInvitees, usernames);
  
  var that = this.invitees;
  _.each(usernames, function(user){
    var curUserRoom = that[user] || [];
    if(curUserRoom.indexOf(meetingID) === -1){
      curUserRoom.push(meetingID);
    }
    that[user] = curUserRoom;
  });
};

//alert user who were already online, but was invited during that time
//or those who were deleted from a meeting. will alert them with new invite list
MeetingManager.prototype.alertInvite = function(usernames){
  var that = this;
  _.each(usernames, function(user){
    var userSocket = that.getUser(user);
    if(userSocket){
      userSocket.emit('inviteList', that.checkInvite(user) );
    }
  });
};

//check if user is invited to a room, can be called when a user first join or from alertInvite function
//will return an empty array if user is not invited to anything
MeetingManager.prototype.checkInvite = function(username){
  if(this.invitees[username] !== undefined){
    return this.invitees[username];
  } else {
    return [];
  }
};

module.exports = MeetingManager;