var expect = require('chai').expect();
var io = require('socket.io')();

io.listen('9001');

var socket = require('socket.io-client').connect('http://localhost:9001');

describe('WebRTC suite',function(){
  var WebRTC;
  var Signaller;
  var RTC;
  var Stream = function(audio, video){
    this.audio = audio;
    this.video = video;
    this.getAudioTracks = function(){
      return this.audio;
    };

    this.getVideoTracks = function(){
      return this.video;
    };
  };
  describe('WebRTC object', function(){

    WebRTC = require('./webrtc')(console.log);
    it('Should add streams to its data store', function(){
      expect(WebRTC).to.haveOWnProperty('addStream');
      var user = 'John';
      WebRTC.addStream(user, new Stream('anAudioStream','aVideoStream'));
    });

  });

  describe('Signaller object', function(){
    Signaller = require('./signalling')(socket);
  });

  describe('RTC object', function(){
    var RTC = require('./rtcpeerconnection')(WebRTC, Signaller, console.log);
  });

});
