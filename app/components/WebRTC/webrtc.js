//User a function to make this easily adaptable to angular
function WebRTC(){
	var webrtc = {};
	var me = { stream: null, id:null };
	var peers = {};

	webrtc.setRTC = function(peerObj){
		peers = peerObj;
	};

	webrtc.getPeers = function(){
		return peers.getPeers();
	};

	webrtc.addLocalStream = function(stream){
		me.stream = stream;
	};

	//Actions to take when receiving a local stream
	webrtc.onLocalStream = function(callback){
		webrtc.onLocalStream = callback;
	};

	webrtc.onlocalstream = function(stream){
		webrtc.addLocalStream(stream);
		webrtc.onLocalStream(stream);
	};

	//Actions to be taken when receiving a remote stream
	webrtc.onRemoteStream = function(callback){
		webrtc.onRemoteStream = callback;
	};

	webrtc.onremotestream = function(peer){
		webrtc.onRemoteStream(stream, peer.id, peer);
	};

	webrtc.onRemoteStreamRemoval = function(callback){
		webrtc.onRemoteStreamRemoval = callback;
	};

	webrtc.onremotestreamremoval = function(peer){
		webrtc.onRemoteStreamRemoval(peer);
	};

	webrtc.getAllUsers = function(){
		var ids = [];
		var peers = webrtc.getPeers();
		peers.forEach(function(pc){
			ids.push(pc.id);
		});
		return ids;
	};

	webrtc.getUser = function(user){
		var users = peers.getPeers(user);
		if(users){
			return users[0];
		}
	};
	//Stream has all associated streams, video/audio/datachannel
	webrtc.getStream = function(user){
		var peer = webrtc.getUser(user);
		if(peer !== undefined){
			return peer.stream;
		}
	};

	webrtc.getVideoStream = function(user){
		var stream = webrtc.getStream(user);
		if(stream !== undefined) {
			return stream.getVideoTracks();
		}
	};

	webrtc.getAudioStream = function(user){
		var stream = webrtc.getStream(user);
		if(stream !== undefined) {
			return stream.getAudioTracks();
		}
	};

	webrtc.setId = function(id){
		me.id = id;
	};

	webrtc.getMyInfo = function(){
		return me;
	};

	webrtc.RTC = function(){
		return peers;
	};
	return webrtc;
}
module.exports = WebRTC;