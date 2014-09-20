//Define socket.io handlers here
module.exports = function(server){
  var io = require('socket.io')(server);

  //our meeting manager object
  var meetingManager = function(){
    this.meetings = {};
    this.users = {};
  };

  meetingManager.prototype.addMeeting = function(data){
    var id = data.id;
    this.meetings[id] = data;
  };

  meetingManager.prototype.getMeeting = function(id){
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

  var manager = new meetingManager();

  io.on('connect', function(socket){
    console.log('Received new socket connection');
  });


  var managerSpace = io.of('/manager');

  managerSpace.on('connect', function(socket){
    
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

  });


  return io;
};
