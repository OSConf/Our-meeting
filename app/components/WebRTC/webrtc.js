//User a function to make this easily adaptable to angular

function WebRTC(){
	var webrtc = {};
	var me = { stream: null, id:null };
	var rtc = {};
	var users = [];
  var constraint = {
    audio:true,
    video:true
  };
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

	//Gets own media stream, and appends onto the dom
  function myMedia(){
    //sdspter.js
    getUserMedia(constraint, function(stream){
      me.stream = stream;
    }, function(err){
      console.log(e);
    });
  }

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
		return get(user, 'dataStreams');
	};

	webrtc.getRTC = function(user){
		return rtc[user];
	};

	webrtc.setRTC = function(user, peerConnection){
		rtc[user] = peerConnection;
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
		users.push(user);
	};

	webrtc.getAllUsers = function(){
		return users;
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
