var WebRTC = require('om-webrtc');
var Signaller = require('./signalling.js')();
var rtcman = require('./webrtc.js')();
var config = {};

config.transport = function(){
  return Signaller;
};

config.signallerConfig = function(transport){
  return {
    send:transport.send,
    receive:transport.receive
  };
};

//What to do when a new stream is received
//Should have properties onLocalStream, onRemoveLocalStream, onRemoteStream, onRemoveRemoteStream
config.streamConfig = {
  onLocalStream: function(stream){
    rtcman.onlocalstream(stream);
  },
  onRemoteStream: function(peer){
    rtcman.onremotestream(peer);
  },
  onRemoveRemoteStream: function(peer){
    rtcman.onremotestreamremoval(peer);
  }
};

rtcman.setRTC(new WebRTC(config));

module.exports = rtcman;