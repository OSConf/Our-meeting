var assert = require('assert');
var should = require('should');
var User = require('../User');
var stubs = require('./stubs');


describe('Users', function () {
  var signaller = stubs.signaller;

  var admin = stubs.admin;

  var webrtc = stubs.webrtc;
  console.log(webrtc().getMyInfo());

  describe('user : CurrentUser', function(){
    var CurrentUser = User('user');
    var testUser;

    beforeEach(function(){
      var testName1 = 'Test1';
      var testUsername1 = 'TestUser1';
      var testId = 1;
      testUser = new CurrentUser(testUsername1, testId, testName1);
      testUser.newWebRTC(webrtc);
    });

    it('Should be a class and exist', function(){
      CurrentUser.should.not.equal(undefined);
      CurrentUser.should.be.an.instanceOf(Object);
    });

    it('Should create a new Object', function(){
      testUser.should.not.equal(undefined);
      testUser.should.be.an.instanceOf(Object);

      testUser.username.should.equal('TestUser1');
      testUser.name.should.equal('Test1');
      testUser.id.should.equal(1);
    });

    it('Its method newWebRTC should set the webrtc property', function(){
      testUser.webrtc = null;
      (testUser.webrtc === null).should.be.ok;
      var rtc = testUser.newWebRTC(webrtc);
      rtc.should.be.ok;
      testUser.webrtc.should.be.ok;
    });

    it('Should get the webrtc', function(){
      testUser.getWebRTC().should.be.ok;
    });

    it('Should create a remove the old webrtc when a new one is created', function(){
      var old = testUser.getWebRTC();
      testUser.newWebRTC(webrtc).should.not.equal(old);
    });

    it('Should add events onto webrtc object', function(){
      var rtc = testUser.getWebRTC();
      rtc.evts.should.be.instanceOf(Array);
      testUser.on.should.be.instanceOf(Function);

      testUser.on('test', function(){});
      rtc.evts.length.should.equal(1);
      rtc.evts[0].evt.should.equal('test');
    });

    it('Should add old events to new webrtc object', function(){
      testUser.on('test', function(){});
      testUser.newWebRTC(webrtc);

      var rtc = testUser.getWebRTC();

      rtc.evts.should.be.instanceOf(Array);
      rtc.evts.length.should.equal(1);
      rtc.evts[0].evt.should.equal('test');
    });

    it('Should return user stream', function(){
      (testUser.stream === null).should.be.ok;
      testUser.getStream().should.be.ok;
      testUser.stream.should.be.ok;
    });

    it('Should return media stream controller, or undefined if stream is not set', function(){
      testUser.getStream().should.be.ok;
      var controls = testUser.getStreamControls();
      controls.should.be.instanceOf(Object);
      testUser.stream = null;
      testUser.webrtc = null;
      controls = testUser.getStreamControls();
      (controls === undefined).should.be.ok;
    });
  });
});
