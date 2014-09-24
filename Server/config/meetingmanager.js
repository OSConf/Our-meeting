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
  this.meetings[id] = new Meeting(id);
};

//ability to get all meetings or just one specific meeting
MeetingManager.prototype.getMeeting = function(id){
  //if id is not passed in, return all meetings
  if(id===undefined){
    return Object.keys(this.meetings);
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

//ability to add a user with a reference to the socket
MeetingManager.prototype.addUser = function(username, socket){
  this.users[username] = socket;
  this.socketIds[socket.id] = username;
};

//ability to get all users or just one specific user
MeetingManager.prototype.getUser = function(username){
  //if username is not passed in, return all users
  if(username===undefined){
    return Object.keys(this.users);
  } else {
    //if username does not exist, throw error
    if(this.users[username] === undefined){
      throw Error("User not found");
    //else, return the socket reference for the username
    } else {
      return this.users[username];
    }
  }
};

MeetingManager.prototype.getBySocketId = function(id){
  console.log(this.socketIds);
  if(id === undefined){
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

  for(var i = 0; i < usernames.length; i++){
    var curUserRoom = this.invitees[usernames[i]] || [];
    if(curUserRoom.indexOf(meetingID) === -1){
      curUserRoom.push(meetingID);
    }
    this.invitees[usernames[i]] = curUserRoom;
  }
};

MeetingManager.prototype.checkInvite = function(username){
  if(this.invitees[username] !== undefined){
    return this.invitees[username];
  }
};

module.exports = MeetingManager;