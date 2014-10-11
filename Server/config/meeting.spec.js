var assert = require('assert');
var should = require('should');
var MeetingManger = require('./meetingmanager.js');
var manager = new MeetingManger();

var socket = {id: '12345', emit: function () {}};
var socket2 = {id: '67890', emit: function () {}};


describe('Meeting Manager', function () {

  it('should be able to add a user', function () {
    var username = 'tom';
    manager.addUser(username, socket);
  });

  it('should be able to get added users', function () {
    var username = 'tom';
    manager.getUser(username).should.equal(socket);
    manager.getUser().should.containEql(username);
  });

  it('should be able to add multiple users', function () {
    var username = 'sally';
    manager.addUser(username, socket2);
  });

  it('should be able to get multiple users', function () {
    var username = 'tom';
    var username2 = 'sally';
    manager.getUser(username).should.equal(socket);
    manager.getUser(username2).should.equal(socket2);
    manager.getUser().should.be.an.instanceOf(Array).and.containEql(username, username2);
  });

  it('should be able to add a meeting', function () {
    var id = '123';
    manager.addMeeting(id);
  });

  it('should be able to get added meeting', function () {
    var id = '123';
    manager.getMeeting(id).id.should.equal(id);
  });

  it('should have meetings with property id, meetUsers and meetInvitees', function () {
    var id = '123';
    var meeting = manager.getMeeting(id);
    meeting.should.be.an.instanceOf(Object).and.have.properties('id', 'meetUsers', 'meetInvitees');
  });

  it('should be able to add a multiple meetings', function () {
    var id = '456';
    manager.addMeeting(id);
  });

  it('should be able to get all meetings', function () {
    var id1 = '123';
    var id2 = '456';
    manager.getMeeting(id1).id.should.equal(id1);
    manager.getMeeting(id2).id.should.equal(id2);
    var meetings = manager.getMeeting();
    meetings.should.be.an.instanceOf(Object).and.have.property('meetings');
    meetings.meetings.should.be.an.instanceOf(Array).and.containEql(id1, id2);
  });

  it('should be able to invite users to a meeting', function () {
    var id = '123';
    var usernames = ['tom', 'sally'];
    manager.addUserToMeeting(id, usernames);
  });

  it('should be able to get meetings that users were invited to', function () {
    var username1 = 'tom';
    var username2 = 'sally';
    manager.checkInvite(username1).should.be.an.instanceOf(Array).and.containEql('123');
    manager.checkInvite(username2).should.be.an.instanceOf(Array).and.containEql('123');
  });

  it('should be able to have user join meetings', function () {
    var id = '123';
    var userSocket = socket.id;
    manager.joinMeeting(id, userSocket);
  });

  it('should have user show up in meeting after they have join', function () {
    var id = '123';
    manager.getMeeting(id).meetUsers.should.containEql('tom');
  });

  it('should be able to delete a meeting', function () {
    var id = '123';
    manager.removeMeeting(id);
    manager.getMeeting().meetings.should.not.containEql('123');
  });

  it('should have deleted meeting be removed from invite list for the user', function () {
    var username1 = 'tom';
    var username2 = 'sally';
    manager.checkInvite(username1).should.be.an.instanceOf(Array).and.not.containEql('123');
    manager.checkInvite(username2).should.be.an.instanceOf(Array).and.not.containEql('123');
  });

});