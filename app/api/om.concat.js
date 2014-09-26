//User a function to make this easily adaptable to angular
(function(window){
	function WebRTC(){
		var webrtc = {};
		var me = { stream: null, id:null };
		var rtc = {};
		var users = {};
	  var constraint = {
	    audio:true,
	    video:true
	  };
	  var chats = [];
		var s = {
			streams:{},
			videoStreams:{},
			audioStreams:{},
			dataStreams:{}
		};

		try{
			myMedia();
		} catch(e){
			console.log(e);
		}
		var queue = [];
		//Gets own media stream, and appends onto the dom
	  function myMedia(){
	    //sdspter.js
	    getUserMedia(constraint, function(stream){
	      me.stream = stream;
	      queue.forEach(function(item){
	      	var peer = item.peer;
	      	peer.addStream(me.stream);
	      	peer.continue(item);
	      });
	    }, function(err){
	      console.log(err);
	    });
	  }
	  
	  webrtc.queue = function(item){
	  	queue.push(item);
	  };

		function get(user,stream){
			if(user === undefined){
				return s[stream];
			} else {
				return s[stream][user];
			}
		}

		//Stream has all associated streams, video/audio/datachannel
		webrtc.getStream = function(user){
			return get(user, 'streams');
		};

		webrtc.getVideoStream = function(user){
			return get(user, 'videoStreams');
		};

		webrtc.getAudioStream = function(user){
			return get(user, 'audioStreams');
		};

		webrtc.getDataStream = function(user){
			return webrtc.getRTC(user).chat;
		};

		webrtc.getRTC = function(user){
			return rtc[user];
		};
		webrtc.getUserChat = function(user){
			return webrtc.getDataStream(user);
		};
		webrtc.getChats = function(){
			var messages = chats.slice();
			chats = [];
			return messages;
		};
		webrtc.sendChat = function(message){
			var users = Object.keys(s.dataStreams);
			users.forEach(function(user){
				webrtc.getUserChat(user).send(message);
			});
		};

		webrtc.setRTC = function(user, peerConnection){
			rtc[user] = peerConnection;
			var chat = window.ourMeeting.ChatSetup(user, peerConnection.chat, chats);
		};
		webrtc.addStream = function(user, stream){
			try {
				console.log(stream, 'STREAM!!!');
				s.streams[user] = stream;
				s.videoStreams[user] = stream.getVideoTracks();
				s.audioStreams[user] = stream.getAudioTracks();
			} catch(e){
				console.log(e);
			}
		};

		webrtc.addUser = function(user){
			users[user] = true;
		};

		webrtc.getUser = function(user){
			return users[user];
		};

		webrtc.getAllUsers = function(){
			return Object.keys(users);
		};

		webrtc.getUserInfo = function(user){
			var userInfo = {};
			userInfo.stream = webrtc.getStream(user);
			userInfo.videoStream = webrtc.getVideoStream(user);
			userInfo.audioStream = webrtc.getAudioStream(user);
			userInfo.dataStream = webrtc.getDataStream(user);
			return userInfo;
		};

		webrtc.setId = function(id){
			me.id = id;
		};

		webrtc.getMyInfo = function(){
			return me;
		};
		webrtc.users = users;
		return webrtc;
	}

	if(window.ourMeeting === undefined){
		window.ourMeeting = {};
	}

	window.ourMeeting.webrtc = WebRTC;
})(window);(function(window){
  function Signaller(){
    var socket = io.connect('/manager');
    socket.on('error', function(err){
      console.log('socket error', err);
    });

    //list of events to trigger priority signalling
    var priorityEvents = {
      'waitForAck':true
    };
    //to determine when receiving the same event
    var priority = {};

    function address(to, from, dataObj){
      dataObj.to = to;
      dataObj.from = from;
      return dataObj;
    }

  	return {
      socket:socket,
      hs: sync,
      address: address,
      priority: function(data){
        var userPriorities = priority[data.from];
        if(userPriorities){
          //data.priority is over written when response is sent back
          var pri = userPriorities[data.Status] - data.priority;
          delete priority[data.from];
          return pri;
        }
        return 1;
      },
  		send: function(evt, data){
        console.log('sending signal', evt, data);
  			socket.emit('signal', evt, data);
  		},
  		on: function(evt, callback){
  			socket.on(evt, callback);
  		},
      handshake: function(evt, data){
        if(priorityEvents[data.Status]){
          priority[data.to] = {};
          data.priority = priority[data.to][data.Status] = Date.now();
        }
        socket.emit('handshake', evt, data);
      }
  	};
  }
  function sync(timeout, signaller){
    /*
      Peers have 4 states as Status
      waiting -> not actively communicating
      receiver -> actively communicating, waiting to receive offer
      sender -> actively communicating, offer initiator
      complete -> not actively communicating, communications completed successfully
    */
    console.log('in hs');
    var hs = {};
    var peers = {};
    hs.addPeer = function(id, rtc){
      rtc.SentOffer = false;
      peers[id] = rtc;
    };

    hs.removePeer = function(id){
      delete peers[id];
    };

    function getPeer(id){
      return peers[id];
    }
    function address(from, to, data){
      return signaller.address(to, from, { Status:data });
    }
    signaller.on('handshake', function(evt, data){
      console.log('evt recv', data.Status, data.from);
      var user = data.from;
      var me = data.to;
      var peer = getPeer(user);
      console.log('my status', peer.Status);

      if(peer.Status === undefined){
        signaller.emit('cancel', address(me, user, undefined));
        return;
      }

      if(evt === 'ack'){
        if(data.Status === 'receive' && peer.Status === 'sender'){
            //The other side is ready to receive offer
            console.log('matched init wrtc');
            if(!peer.SentOffer){
              peer.checkForStream(function(){
                peer.offer();
                peer.SentOffer = true;
              });
            }
        } else if(peer.Status === 'waiting'){
          
          if(data.Status === 'sender'){
            //When receiving, the connection will wait for an offer
            peer.Status = 'receive';
            signaller.handshake('ack', address(me, user, peer.Status));
          } 

        } else if(peer.Status === 'receive'){
          if(data.Status === 'sender'){
            signaller.handshake('ack', address(me, user, peer.Status)); 
          }
        }
      } else if(evt === 'cancel'){
        peer.Status = 'waiting';
      } else if(evt === 'query'){
        var message = address(me, user, peer.Status);
        message.expect = peer.Status === 'sender' ? 'receive': 'sender';
        signaller.handshake('answer-query', message);
      } else if(evt === 'answer-query'){
        peer.Retry = 0;
        peer.Status = data.expect;
        signaller.handshake('ack', address(me, user, peer.Status));
      }
    });
  console.log(hs);
    return hs;
  }
  if(window.ourMeeting === undefined){
    window.ourMeeting = {};
  }

  window.ourMeeting.Signaller = Signaller;
})(window);(function(window){
  function RTC(WebRTC, Signaller){
  	var rtc = {};

  	Signaller.on('signal', function(evt, data){
  		try {
  			var peer = WebRTC.getRTC(data.from);
  			if(evt === 'offer'){
          console.log(data);
          peer.checkForStream(function(){
  				  peer.onOffer(data.data);
          });
  			} else if(evt === 'answer'){
          peer.checkForStream(function(){
  				  peer.onAnswer(data.data);
          });
  			} else if(evt === 'ice'){
  				peer.queueIce(data.data);
        } else if(evt === 'ready'){
          peer.processIce();
        } else {
  				throw new Error('Unknown signal ' + evt);
  			}
  		} catch(e) {
  			console.log(e);
  		}
  	});

  	function createRTC(user){
  		var ice = [];
  		var peer = new RTCPeerConnection({'iceServers':[{'urls':'stun:stun.iptel.org'}]});
      peer.chat = peer.createDataChannel('om-chat');
  		//Must have local stream attached before doing anything
      peer.checkForStream = function(success){
        var myStream = WebRTC.getMyInfo().stream;
        if(myStream){
    		  peer.addStream(myStream);
          success();
        } else {
          setTimeout(function(){
            peer.checkForStream(success);
          }, 3000);
        }
      };

  		//Must have local description before sending offer or answer
  		peer.hasLocalDescription = function(){
  			return !!this.localDescription;
  		};

  		//Must have remote description before sharing ice candidates
  		peer.hasRemoteDescription = function(){
  			return !!this.remoteDescription;
  		};

  		peer.queueIce = function(candidate){
  			ice.push(candidate);
  		};

  		//Process ice candidates when ready
  		peer.processIce = function(){
  			if(peer.hasLocalDescription() && peer.hasRemoteDescription){
  				ice.forEach(function(candidate, i, arr){
  					peer.addIceCandidate(new RTCIceCandidate(candidate));
            arr.splice(i,1);
  				});
  			} else {
          setTimeout(function(){
            peer.processIce();
          }, 2000);
        }
  		};
      
  		peer.onaddstream = function(stream){
  			WebRTC.addStream(user, stream.stream);
  		};

  		peer.onicecandidate = function(event){
      	if (event.candidate) {
          signaller.send('ice', wrapData(event.candidate));
        }
      };

      peer.offer = function(){
      	this.createOffer(function(description){
      		peer.setLocalDescription(description, function(){
      			Signaller.send('offer', wrapData(description));
      		}, console.log);
      	}, console.log);
      };

      peer.answer = function(){
      	this.createAnswer(function(description){
      		peer.setLocalDescription(description, function(){
      			Signaller.send('answer', wrapData(description));
            peer.processIce();
      		}, console.log);
      	},console.log);
      };

      peer.onAnswer = function(description){
        if(description.type === 'offer') return;
      	try{
      		this.setRemoteDescription(new RTCSessionDescription(description), function(){
            peer.processIce();
      		}, console.log);
      	} catch(e){
      		console.log(e);
      	}
      };

      peer.onOffer = function(description){
        if(description.type === 'answer') return;
        console.log('rec descr', description);
  			try{
          peer.setRemoteDescription(new RTCSessionDescription(description), function(success){
            peer.answer();
          }, console.log);
        } catch(e){
          console.log(e);
        }
      };


      //Communication addressing
  	  function wrapData(info){
  			return {
  				from: WebRTC.getMyInfo().id,
  				to:user,
  				data:info
  			};
  		}

      //When both sides are ready, signalling begins
      peer.ready = false;

  		return peer;
  	}

  	rtc.newPeer= function(user){
  			WebRTC.setRTC(user, createRTC(user));
  			return WebRTC.getUserInfo(user);
  	};

  	return rtc;
  }

  if(window.ourMeeting === undefined){
    window.ourMeeting = {};
  }
  window.ourMeeting.RTC = RTC;
})(window);(function(obj) {
  // Load webrtc here
  //var client = io({url:'http://localhost'});
  var webrtc = obj.ourMeeting.webrtc();
  var signaller = obj.ourMeeting.Signaller();
  var RTC = obj.ourMeeting.RTC(webrtc, signaller);

  var Streams = function() {};

  var User = function() {};

  obj.ourMeeting = function() {
    /* Statics */
  };

  obj.ourMeeting.prototype.whiteboard = {
    insert: function() {

    }
  };

  obj.ourMeeting.prototype.meeting = {
    getMeeting: function(meetingID) {

    },
    invitedUsers: function(meetingID) {

    },
    connectedUsers: function(meetingId) {

    },
    sendMessage: function(message, meetingID) {

    },
    retreiveMessages: function(meetingID) {

    }
  };

  obj.ourMeeting.prototype.admin = {
    createMeeting: function() {

    },
    openMeetings: function() {

    },
    findUser: function(userID) {

    },
    closeMeeting: function(meetingID) {

    }
  };

  obj.ourMeeting.prototype.currentUser = {
    joinMeeting: function(meetingID) {

    },
    checkInvites: function() {

    },
    name: 'name',
    getStreams: function() {

    },
    leaveMeeting: function(meetingID) {

    }
  };
})(window);angular.module('ourMeeting', [])
  .controller('ourMeetingCtrl', ['$scope', '$timeout', '$interval', function($scope, $timeout, $interval) {
    $scope.meeting = {
      users: []
    };

    var userCheck = $interval(function() {
      $scope.meeting.users = webrtc.getAllUsers();
      
      $scope.meeting.users.forEach(function (id, index) {
        $scope.attachVideos(id);
      });
    }, 5000);

    $scope.meeting.videos = {};


    $scope.attachVideos = function(id) {

      if($scope.meeting.videos[id] === undefined) {
        var stream = webrtc.getStream(id);
        if(stream !== undefined && stream !== null) {
          $scope.meeting.videos[id] = stream;
          var parent = document.getElementById(id);
          if (attachMediaStream(parent, stream) === false) {
            $scope.meeting.videos[id] = undefined;
          }
        }
      }
    };

    $scope.attachToWhiteboard = function (id) {
      var whiteboard = document.getElementById('whiteboard');
      if (whiteboard.childNodes.length > 0) {
        var old_video = whiteboard.childNodes[0];
        var elem = document.getElementsByClassName(old_video.id)[0];
        elem.appendChild(old_video);
        elem.childNodes[0].play();
      }

      var video = document.getElementById(id);
      whiteboard.innerHTML = '';
      whiteboard.appendChild(video);
      whiteboard.childNodes[0].play();
    };

    $scope.$on('new-user', function(data) {
      var log = data || 'heya';
      console.log(log);
    });

    $scope.$on('$destroy', function() {
      $interval.cancel(userCheck);
    });

  }])
  .directive('omMeeting', function() {
    return {
      restrict: 'E',
      transclude: true,
      template: '<om-whiteboard></om-whiteboard><om-users></om-users><om-chat></om-chat>'
    };
  })
  .directive('omWhiteboard', function() {
    return {
      restrict: 'E',
      template: '<div id="whiteboard"></div>'
    };
  })
  .directive('omUsers', function() {
    return {
      restrict: 'E',
      template: '<ul class="users"><li class="{{user}}" ng-click="attachToWhiteboard(user)" ng-repeat="user in meeting.users"><video id="{{user}}" autoplay></li></ul>',
    };
  })
  .directive('omChat', function() {
    return {
      restrict: 'E',
      template: '<ul class="chat"><li ng-repeat="chat in meeting.chat">{{chat.name}}: {{chat.message}}</li></ul>'
    };
  });
  