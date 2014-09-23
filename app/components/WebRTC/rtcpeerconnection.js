function RTC(WebRTC, Signaller){
	var rtc = {};

	Signaller.on('signal', function(evt, data){
		try {
			var peer = WebRTC.getRTC(data.from);
			if(evt === 'offer'){
        console.log(data);
				peer.onOffer(data.data);
			} else if(evt === 'answer'){
				peer.onAnswer(data.data);
			} else if(evt === 'ice'){
				peer.queueIce(data.data);
			} else if(evt === 'ready'){
        console.log('received ready');
        if(peer.ready){
          console.log('sending offer');
          peer.offer();
        }
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

		//Must have local stream attached before doing anything
    var myStream = WebRTC.getMyInfo().stream;
    if(myStream){
		  peer.addStream(myStream);
    }

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
				ice.forEach(function(candidate){
					peer.addIceCandidate(new RTCIceCandidate(candidate));
				});
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
    		}, console.log);
    	},console.log);
    };

    peer.onAnswer = function(description){
    	try{
    		this.setRemoteDescription(new RTCSessionDescription(description), function(){
    		}, console.log);
    	} catch(e){
    		console.log(e);
    	}
    };

    peer.onOffer = function(description){
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
