module.exports = function(){
  //holds our meetings and users
  this.meetings = {};
  this.users = {};
};

//ability to add meetings
module.exports.prototype.addMeeting = function(data){
  var id = data.id;
  this.meetings[id] = data;
};

//ability to get all meetings or just one specific meeting
module.exports.prototype.getMeeting = function(id){
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
module.exports.prototype.addUser = function(socket){
  this.users[socket.username] = socket;
};

//ability to get all users or just one specific user
module.exports.prototype.getUser = function(username){
  //if username is not passed in, return all users
  if(username===undefined){
    return Object.keys(this.users);
  } else {
    //if username does not exist, throw error
    if(!this.users[username]){
      throw Error("User not found");
    //else, return the socket reference for the username
    } else {
      return this.users[username];
    }
  }
};