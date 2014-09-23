//Define socket.io handlers here
module.exports = function(server){
  var io = require('socket.io')(server);
  var MeetingManger = require('./meetingmanager');
  var manager = new MeetingManger();

  //on connection...
  io.on('connection', function(socket){
    console.log('Received new socket connection');

    //when user join, client will emit "user ready" and send data with username
    socket.on('user-ready', function(data) {
      //adding username property onto the socket
      socket.username = data.username;
      //adding the user to our meeting manager object
      manager.addUser(socket);
    });

    //listen for when user disconnect so we can remove them from our users object
    //this still needs work!!!
    socket.on('disconnect', function(){
      console.log('user disconnected');
      socket.emit('user-disconnected', { username: socket.username });
      delete manager.users[socket.username];
    });

  });

  //creating our manager name space
  var managerSpace = io.of('/manager');

  //manager space on connection...
  managerSpace.on('connection', function(socket){
    
    //when client emits add
    socket.on('add', function(data){
      try {
        //it will add a meeting to the meeting manager
        manager.addMeeting(data);
        socket.emit('success');
      } catch(e) {
        socket.emit('err', e.message);
      }
    });

    //when client emits get, client send over nothing or meeting name/id
    socket.on('get', function(id){
      try {
        //it will get all meetings or specific meetings from the meeting manager
        socket.emit('meeting', manager.getMeeting(id) );
        socket.emit('success');
      } catch(e) {
        socket.emit('err', e.message);
      }
    });

    //when client emits get-user, client when send over nothing or username
    socket.on('get-user', function(username){
      try {
        //it will get all users or specific user's referenced socket
        socket.emit('user', manager.getUser(username) );
        socket.emit('success');
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

  });

  return io;
};