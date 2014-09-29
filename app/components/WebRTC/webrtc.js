//User a function to make this easily adaptable to angular
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
module.exports = WebRTC;