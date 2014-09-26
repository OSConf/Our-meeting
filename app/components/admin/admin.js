var _ = require('lodash');


function Admin(signaller){
  var admin = {};

  //helper function to take care of turning off success and error listener
  //and taking in either a success or failure callback to process the data
  function onReply(callback, evt, data){
    if(evt){
      signaller.off(evt+'-success');
      signaller.off(evt+'-error');
    }
    if( typeof callback === 'function'){
      callback(data);
    }
  }

  admin.addMeeting = function(meetingID, success, failure){
    //emits 'add', passing meetingID over
    signaller.send('add', meetingID);
    //nothing special, listens for 'success' and return ID back
    signaller.on('add-success', function(data){
      onReply(success, 'add', data);
    });
    signaller.on('add-error', function(data){
      onReply(success, 'add', data);
    });
  };

  admin.removeMeeting = function(meetingID, success, failure){
    //emits 'remove', passing meetingID over
    signaller.send('remove', meetingID);
    //nothing special, listens for 'success' and return ID back
    signaller.on('remove-success', function(data){
      onReply(success, 'remove', data);
    });
    signaller.on('remove-error', function(data){
      onReply(success, 'remove', data);
    });
  };

  admin.getMeeting = function(meetingID, success, failure){
    //emits 'get', passing meetingID over to get a specific meeting info
    //if nothing is passed in, a list of all meetings will be returned as an array
    signaller.send('get', meetingID);
    //listens for 'get-success' on return data, type of data = list of all meetings or a specific meeting object
    signaller.on('get-success', function(data){
      onReply(success, 'get', data);
    });
    signaller.on('get-error', function(data){
      onReply(failure, 'get', data);
    });
  };

  //ex. admin.inviteUser("myroom", ["john","sally"])
  admin.inviteUser = function(meetingID, usernames, success, failure){
    //emits 'invite-user', passing in meetingID and an array of users to be invited
    signaller.send('invite-user', meetingID, usernames);
    signaller.on('invite-user-success', function(){
      onReply(sucess, 'invite-user');
    });
    signaller.on('invite-user-error', function(){
      onReply(failure, 'invite-user');
    });
    //server will also emit 'inviteList' to clients that were invited who are online
    //client should listen for 'inviteList' to be alerted that they are invited
  };

  admin.getUser = function(username, success, failure){
    //emits 'get-user', passing in a username to get a specific user's socket info
    //if nothing is passed in, a list of all users will be returned as an array
    signaller.send('get-user', username);
    //listens for 'user' on return data, data = list of all users or a specific user's socket
    signaller.on('get-user-success', function(data){
      onReply(sucess, 'get-user', data);
    });
    signaller.on('get-user-error', function(data){
      onReply(failure, 'get-user', data);
    });
  };

  return admin;
}