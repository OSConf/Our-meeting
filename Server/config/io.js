//Define socket.io handlers here
module.exports = function(server){
  var io = require('socket.io')(server);
  var _ = require('lodash');

  //our meeting manager object
  var MeetingManager = function(){
    this.meetings = {};
    this.users = {};
  };

  MeetingManager.prototype.addMeeting = function(data){
    var id = data.id;
    this.meetings[id] = data;
  };

  MeetingManager.prototype.getMeeting = function(id){
    //if id is not passed in, return all meetings
    if(id===undefined){
      return Object.keys(this.meetings);
    } else {
      //if meeting does not exist, throw error
      if(!this.meetings[id]){
        throw Error("Meeting not found");
      } else {
        //return the meeting
        return this.meetings[id];
      }
    }
  };

  MeetingManager.prototype.addUser = function(socket){
    this.users[socket.username] = socket;
  };

  MeetingManager.prototype.getUser = function(username){
    if(username===undefined){
      return Object.keys(this.users);
    } else {
      if(!this.users[username]){

      } else {
        return this.users[username];
      }
    }
  };



  var manager = new MeetingManager();

  io.on('connection', function(socket){
    console.log('Received new socket connection');

    //when user join, client will emit "user ready"
    socket.on('user-ready', function(data) {
      socket.username = data.username;
      manager.addUser(socket);
    });

    //listen for when user disconnect so we can remove them from our users object
    socket.on('disconnect', function(){
      console.log('user disconnected');
      var user = manager.users[socket.id];
      socket.emit('user-disconnected', { username: user });
      delete manager.users[socket.id];
    });

  });

  var managerSpace = io.of('/manager');

  managerSpace.on('connection', function(socket){
    
    socket.on('add', function(data){
      try {
        manager.addMeeting(data);
        socket.emit('success');
      } catch(e) {
        socket.emit('err', e.message);
      }
    });

    socket.on('get', function(id){
      try{
        socket.emit('meeting', manager.getMeeting(id) );
        socket.emit('success');
      } catch(e) {
        socket.emit('err', e.message);
      }
    });

    socket.on('get-user', function(){
      socket.emit('user', manager.getUser() );
    });

    socket.on('signal', function(evt, data){
      var user = data.to;
      var to = manager.getUser(user);
      to.emit('signal', evt, data);
    });

  });

  return io;
};
