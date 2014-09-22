function RTC(WebRTC, Signaller, error_handler){
	var rtc = {};

	Signaller.on('signal', function(evt, data){
		try {
			var peer = WebRTC.getRTC(data.from);
			if(evt === 'offer'){
				peer.onOffer(data.description);
			} else if(evt === 'answer'){
				peer.onAnswer(data.description);
			} else if(evt === 'ice'){
				peer.queueIce(data.candidate);
			} else {
				throw new Error('Unknown signal ' + evt);
			}
		} catch(e) {
			error_handler(e);
		}
	});

	function createRTC(user){
		var ice = [];
		var peer = new RTCPeerConnection({'iceServers':[{'urls':'stun:stun.iptel.org'}]});

		//Must have local stream attached before doing anything
		peer.addStream(WebRTC.getMyInfo().stream);

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
		function processIce(){
			if(peer.hasLocalDescription() && peer.hasRemoteDescription){
				ice.forEach(function(candidate){
					peer.addIceCandidate(new RTCIceCandidate(candidate));
				});
			}
		}
		peer.onaddstream = function(stream){
			WebRTC.addStream(user, stream);
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
    		}, error_handler);
    	}, error_handler);
    };

    peer.answer = function(){
    	this.createAnswer(function(description){
    		peer.setLocalDescription(description, function(){
    			Signaller.send('answer', wrapData(description));
    			processIce();
    		}, error_handler);
    	},error_handler);
    };

    peer.onAnswer = function(description){
    	try{
    		this.setRemoteDescription(new RTCSessionDescription(description), function(){
    			processIce();
    		}, error_handler);
    	} catch(e){
    		error_handler(e);
    	}
    };

    peer.onOffer = function(description){
			try{
        pc.setRemoteDescription(new RTCSessionDescription(description), function(success){
          peer.answer();
        }, error_handler);
      } catch(e){
        error_handler(e);
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

		return peer;
	}

	rtc.newPeer= function(user){
			WebRTC.setRTC(user, createRTC(user));
			return WebRTC.getUserInfo(user);
	};
	return rtc;
}
