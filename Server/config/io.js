//Define socket.io handlers here
module.exports = function(server){
  var io = require('socket.io')(server);
  var MeetingManger = require('./meetingmanager.js');
  var manager = new MeetingManger();

  //creating our test room
  manager.addMeeting('test1');
  manager.addMeeting('test2');
  manager.addMeeting('test3');
  manager.addMeeting('test4');
  manager.addUserToMeeting('test1', ['user1', 'user2', 'user3']);
  manager.addUserToMeeting('test2', ['user1', 'user2', 'user3']);
  manager.addUserToMeeting('test3', ['user1', 'user2', 'user3']);
  manager.addUserToMeeting('test4', ['user1', 'user2', 'user3']);

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
      console.log('user-ready was emitted from client from ', data.username);
      username = data.username;
      //adding the user to our meeting manager object
      manager.addUser(username, socket);
      managerSpace.emit('updateList', manager.getUser());
      //Check if user was invite to any meetings
      var meetings = manager.checkInvite(username);
      if(meetings.length > 0){
        socket.emit('inviteList', meetings);
      }
    });

    /*
    socket.on('join', function(data){
      socket.join(data.room);
      socket.myroom = data.room;
      console.log('joined to room', data);
      socket.broadcast.to(data.room).emit('new-peer', {id:socket.id});
    });
    */

    //listen for when user disconnect so we can remove them from our users object
    //this still needs work!!!
    socket.on('disconnect', function(){
      console.log('user disconnected');
      try {
        var username = manager.getBySocketId(socket.id);
        socket.broadcast.to(socket.roomID)
          .emit('peer-disconnect', {id:socket.id});
          console.log('did', socket.id);

        delete manager.users[username];
        delete manager.socketIds[socket.id];
      } catch(e) {
        console.log(e.message);
      }
    });

    //when client emits add, client send over id
    socket.on('add', function(data){
      try {
        //it will add a meeting to the meeting manager
        socket.emit('add-success', manager.addMeeting(data));
      } catch(e) {
        socket.emit('add-error', e.message);
      }
    });

    //when client emits remove, client send over id
    socket.on('remove', function(data){
      try {
        //it will add a meeting to the meeting manager
        socket.emit('remove-success', manager.removeMeeting(data));
      } catch(e) {
        socket.emit('remove-error', e.message);
      }
    });

    //when client emits get, client send over nothing or meeting name/id
    socket.on('get', function(id){
      try {
        //it will get all meetings or specific meetings from the meeting manager
        socket.emit('get-success', manager.getMeeting(id));
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
        console.log('check-invite was emitted from client ', username);
        //note: should look at this one again, client will listen for invitelist at all time, no need for success emit?
        socket.emit('inviteList', manager.checkInvite(username) );
        socket.emit('check-invite-success');
      } catch(e) {
        socket.emit('check-invite-error', e.message);
      }
    });

    //when client emits join, they will join the room
    socket.on('join', function(room){
      console.log('received join', room);
      try {
        //check if meeting exist, throws error if not found
        var meeting = manager.getMeeting(room.id);
        //if meeting exist then the client will join the room

        /* Currently allowing to join any room name */
        //
        if(socket.roomID !== undefined){
          console.log('leaving room ', socket.roomID);
          socket.leave(socket.roomID);
          socket.roomID = undefined;
        }
        //joining the meeting
        socket.join(room.id);
        socket.roomID = room.id;
        if(meeting){
          //adding user to the active user list for the meeting
          manager.joinMeeting(room.id, socket.id);
          //grab active user list for this meeting and send to all users in room
          //var meetingList = manager.getMeetingList(room.id);
          socket.emit('join-success');
        }
        socket.broadcast.to(room.id).emit('new-peer', {id:socket.id});

      } catch(e) {
        console.log(e);
        socket.emit('err', e.message);
      }
    });

    //when client emits signal, it will send over evt(event) and data
    socket.on('signal', function(data){
      console.log(socket.id, 'Forwarding to', data.to);
      socket.broadcast.to(data.to).emit('signal', {message:data, id:socket.id});
    });

  });
  return io;
};