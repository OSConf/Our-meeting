

var MeetingManager = function(){
  //holds our meetings and users
  this.meetings = {};
  this.users = {};
  this.socketIds = {};
};

//ability to add meetings
MeetingManager.prototype.addMeeting = function(data){
  var id = data.id;
  this.meetings[id] = data;
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

module.exports = MeetingManager;