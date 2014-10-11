// var WebRTC = require('om-webrtc');
// var Admin = require('../components/admin/admin.js');
// var API = function OurMeeting(signaller){
//   // Load webrtc here

  
//   var webrtc = new WebRTC({
//     webrtcConfig: {
//       debug:false
//     }
//   });

//   var adminService = new Admin(signaller);

//   //var Streams = function() {};

//   // var User = function(username, id) {

//   // };

//   var Meeting = function(meetingID){
//     var meeting = {};

//     adminService.getMeeting(meetingID, function(data){
//       if(meetingID === data.id){
//         meeting.id = meetingID;
//         meeting.invitees = data.meetInvitees;
//         meeting.users = WebRTC.getAllUsers();
//       }
//     });

//     meeting.getID = function(){
//       return this.meeting.id;
//     };
//     meeting.invitedUser = function(){
//       return this.meeting.invitees;
//     };
//     meeting.connectedUsers = function(){
//       return this.meeting.users;
//     };

//     return meeting;
//   };

//   var ourMeeting = function() {
//     /* Statics */
//   };

//   ourMeeting.prototype.admin = {
//     createMeeting: function(userList) {
//       //callback = callback || function() {};

//       adminService.addMeeting(undefined,
//         // Success function
//         function(data) {
//           console.log('Meeting created with ID ' + data);
//           ourMeeting.prototype.admin.inviteUsers(data, userList);
//         },
//         // Failure function
//         function() {
//           console.log('Failed to create meeting');
//         }
//       );
//     },
//     openMeetings: function(callback) {
//       callback = callback || function() {};

//       adminService.getMeeting(undefined,
//         // Success function
//         function(data) {
//           console.log('Meetings retrieved');
//           console.log(data.meetings);
//           callback(data.meetings);
//         },
//         // Failure function
//         function() {
//           console.log('Meetings retrieval failed');
//         }
//       );
//     },
//     findUser: function(userID, callback) {

//       adminService.getUser(userID,
//         // Success function
//         function(data) {
//           console.log('User(s) info retrieved');
//           callback(data);
//         },
//         // Failure function
//         function() {
//           console.log('Failed to get user data');
//         }
//       );
//     },
//     inviteUsers: function(meetingID, userList) {
//       adminService.inviteUser(meetingID, userList,
//         // Success function
//         function() {
//           console.log('Users ' + userList.toString() + ' invited to meeting ' + meetingID);
//         },
//         // Failure function
//         function() {
//           console.log('Failed to invite users');
//         });
//     },

//     // Admin remove meeting function that attempts to remove the given meeting
//     closeMeeting: function(meetingID) {
//       adminService.removeMeeting(meetingID,
//         // Success function
//         function(data) {
//           console.log('Meeting ' + meetingID + ' closed.');
//           console.log(data);
//         },
//         // Failure function
//         function() {
//           console.log('Meeting ' + meetingID + ' failed to close. (May not exist)');
//         }
//       );
//     }
//   };


//   ourMeeting.prototype.currentUser = function(username, id){
//     var me = new User(username, id);
//     me.name = me.username || me.id;
//     me.meetings = {};

//     //should *always* listen for 'inviteList' to get list of rooms
//     signaller.on('inviteList', function(data){
//       //data = array of meeting names
//       data.forEach(function(meeting){
//         if(me.meetings[meeting.id] === undefined){
//           me.meetings[meeting.id] = meeting;
//         }
//       });
//     });

//     //get method which create a users in this scope instansiate new CurrentUsers, occurs once
//     me.joinMeeting = function(meetingID){
//       webrtc.start(function(err){
//         if(err){
//           console.log(err);
//         }

//         signaller.send('join', {id: meetingID});
//       });

//       me.meeting = new Meeting(meetingID);
//     };

//     //Check the server for meetings this user has been invited to
//     me.checkInvites = function(){
//       signaller.send('check-invite');
//     };

//     //A set of functions that allow you to mute/unmute/pause/resume
//     //Media stream
//     me.mediaController = webrtc.streamController;

//     webrtc.on('LocalStreamAdded', function(stream){
//       me.streams = stream;
//     });


//     return me;
//   };

//   return OurMeeting;
// };

// module.exports = function(signaller){ 
//   return new API(signaller);
// };

// //These functions return a class not an object
// var OurMeeting = function(User){

//   var funcs = {
//     currentUser: function(username, id, type){
//       return new User(username, id, type);
//     }
//   };

//   return funcs;
// };

// OurMeeting.prototype.

// //Current user, Admin user, connected users
// //This function returns a user class
// var User = function(webrtc, signaller){

//   var types = {
//     'local': function(){
//       var localEvents = [];
//       return {

//         //Queues events for streams object
//         addEvent: function(evtObj){
//           localEvents.push(evtObj);
//         },
//         joinMeeting: function(meetingID, callback){
//           var self = this;

//           webrtc.start(function(err){
//             if(err){
//               console.log(err);
//             }
//             signaller.send('join', {id: meetingID});
//           });

//           me.meeting = callback(meetingID);
//         },
//         leaveMeeting: function(callback){
//           this.streamController.kill();
//           callback();
//         },

//         //Adds stream to user, then process event queue
//         addStream: function(stream){
//           this.streams = stream;
//           localEvents.forEach(function(evtObj){
//             stream.on(evtObj.evt, evtObj.cb);
//           });
//         }
//       };
//     },
//     'peer': function(){},
//     'admin': function(){}
//   };
  
//   var aUser = function(username, id, type){
//     this.username = username;
//     this.id = id;
//     this.type = type;
//     this.streams = null;
//     this.streamController = null;
//   };

//   aUser.prototype = {};
//   aUser.prototype.on = function(evt, callback){
//     if(this.type === 'peer'){
//       var peer = webrtc.getPeers();
//       peer.on(evt, callback);
//     } else {
//       if(this.streams === null){
//         this.addEvent({evt:evt, cb:callback});
//       } else {
//         this.streams.on(evt, callback);
//       }
//     }
//   };
//   return aUser;
// };

// //Returns 
// var Meeting = function(){

// };

