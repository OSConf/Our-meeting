//Define socket.io handlers here
module.exports = function(server){
  var io = require('socket.io')(server);
  var MeetingManger = require('./meetingmanager');
  var manager = new MeetingManger();

  //on connection...
  io.on('connection', function(socket){

  });

  //creating our manager name space
  var managerSpace = io.of('/manager');

  //manager space on connection...
  managerSpace.on('connection', function(socket){
    console.log('Received new socket connection');
    console.log('user in /manager', socket.id);

    //when user join, client will emit "user ready" and send data with username
    socket.on('user-ready', function(data) {
      //adding username property onto the socket
      username = data.username;
      //send participant info to user
      var users = manager.getUser();
      socket.emit('users', users);
      //adding the user to our meeting manager object
      manager.addUser(username, socket);
      //send userinfo to each participant
      var ids = Object.keys(manager.socketIds);
      for(var i = 0; i < ids.length; i++){
        socket.broadcast.to(ids[i]).emit('new-user', {username:username});
      }
    });

    //listen for when user disconnect so we can remove them from our users object
    //this still needs work!!!
    socket.on('disconnect', function(){
      console.log('user disconnected');
      try {
        var username = manager.getBySocketId(socket.id);
        socket.emit('user-disconnected', { username: username });
        delete manager.users[username];
        delete manager.socketIds[socket.id];
      } catch(e) {
        console.log(e.message);
      }
    });

    //when client emits add
    socket.on('add', function(data){
      try {
        //it will add a meeting to the meeting manager
        socket.emit('add-success', manager.addMeeting(data));
      } catch(e) {
        socket.emit('add-error', e.message);
      }
    });

    //when client emits get, client send over nothing or meeting name/id
    socket.on('get', function(id){
      try {
        //it will get all meetings or specific meetings from the meeting manager
        socket.emit('get-success', manager.getMeeting(id) );
      } catch(e) {
        socket.emit('get-error', e.message);
      }
    });

    //when client emits get-user, client when send over nothing or username
    socket.on('get-user', function(username){
      try {
        //it will get all users or specific user's referenced socket
        socket.emit('get-user-success', manager.getUser(username) );
      } catch(e) {
        socket.emit('get-user-error', e.message);
      }
    });

    //when a client emits this, they can add users to a meeting
    //takes in meetingID and usernames( ex. ["john", "sally"] )
    socket.on('invite-user', function(meetingID, usernames){
      try {
        //add users to meeting and invite list
        manager.addUserToMeeting(meetingID, usernames);
        //alert the those who are invited
        manager.alertInvite(usernames);
        socket.emit('invite-user-success');
      } catch(e) {
        socket.emit('invite-user-error', e.message);
      }
    });

    //check's if a user is invited to any meeting
    socket.on('check-invite', function(username){
      try {
        //note: should look at this one again, client will listen for invitelist at all time, no need for success emit?
        socket.emit('inviteList', manager.checkInvite(username) );
        socket.emit('check-invite-success');
      } catch(e) {
        socket.emit('check-invite-error', e.message);
      }
    });

    //when client emits join, they will join the room
    socket.on('join', function(meetingID){
      try {
        //check if meeting exist, throws error if not found
        var meeting = manager.getMeeting(meetingID);
        //if meeting exist then the client will join the room
        if(meeting){
          //joining the meeting
          socket.join(meetingID);
          //adding user to the active user list for the meeting
          manager.joinMeeting(meetingID, socket.id);
          //grab active user list for this meeting and send to all users in room
          var meetingList = manager.getMeetingList(meetingID);
          managerSpace.to(meetingID).emit('roomList', meetingList);
          socket.emit('join-success');
        }
      } catch(e) {
        socket.emit('err', e.message);
      }
    });

    //when client emits signal, it will send over evt(event) and data
    socket.on('signal', function(evt, data){
      try {
        var user = data.to;
        var to = manager.getUser(user);
        to.emit('signal', evt, data);
      } catch(e) {
        socket.emit('err', e.message);
      }
    });

    socket.on('handshake', function(evt, data){
      console.log('handshake', evt, data.Status, data.from);
      try {
        var user = data.to;
        console.log(evt);
        var to = manager.getUser(user);
        to.emit('handshake', evt, data);
      } catch(e) {
        socket.emit('err', e.message);
      }
    });

  });
  return io;
};