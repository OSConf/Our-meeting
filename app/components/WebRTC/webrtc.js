//User a function to make this easily adaptable to angular

function WebRTC(error_handler){
	var webrtc = {};
	var me = { stream: null, id:null };
	var rtc = {};
	var users = [];
	var s = {
		streams:{},
		videoStreams:{},
		audioStreams:{},
		dataStreams:{}		
	};

	try{
		myMedia();
	} catch(e){
		error_handler(e);
	}

	//Gets own media stream, and appends onto the dom
  function myMedia(){
    getUserMedia(contraint, function(stream){
      myStream.stream = stream;
    }, function(err){
      error_handler(e);
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
		return get(user, streams);
	};

	webrtc.getVideoStream = function(user){
		return get(user, videoStreams);
	};

	webrtc.getAudioStream = function(user){
		return get(user, audioStreams);
	};

	webrtc.getDataStream = function(user){
		return get(user, dataStreams);
	};

	webrtc.getRTC = function(user){
		return rtc[user];
	};

	webrtc.setRTC = function(user, peerConnection){
		rtc[user] = peerConnection;
	};

	webrtc.addStream = function(user, stream){
		try {
			s.streams[user] = stream;
			s.videoStreams[user] = stream.getVideoTracks();
			s.audioStreams[user] = stream.getAudioTracks();
		} catch(e){
			error_handler(e);
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

	webrtc.getMyInfo = function(){
		return me;
	};
	return webrtc;
}