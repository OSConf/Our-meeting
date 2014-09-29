angular.module('ourMeeting', [])
  .controller('ourMeetingCtrl', ['$scope', '$timeout', '$interval', function($scope, $timeout, $interval) {
    $scope.meeting = {
      users: [],
      room: '#1234'
    };

    var userCheck = $interval(function() {
      $scope.meeting.users = webrtc.getAllUsers();
    }, 5000);

    $scope.meeting.videos = {};

    webrtc.onLocalStream(function(stream){
      var elem = document.createElement('video');
      document.getElementById('whiteboard')
        .appendChild(elem);
        attachMediaStream(elem, stream);

    });

    webrtc.onRemoteStream(function(stream, id){
      console.log('remote stream added');

        $scope.attachVideos(stream, id);
    });

    webrtc.onRemoteStreamRemoval(function(peer){
      $scope.removeVideo(peer);
    });

    var rtc = webrtc.RTC();
    rtc.start(null, function(err, stream){
      rtc.transport.socket.emit('join', {id:$scope.meeting.room});
    });

    $scope.attachVideos = function(stream, id) {
      $scope.meeting.videos[id] = stream;
      var parent = document.getElementById(id);
      if (attachMediaStream(parent, stream) === false) {
        $scope.meeting.videos[id] = undefined;
      }
    };

    $scope.removeVideos = function(peer){
      var id = peer.id;
      var parent = document.getElementById(id);
      parent.src = "";
    };

    $scope.attachToWhiteboard = function (id) {
      var whiteboard = document.getElementById('whiteboard');
      if (whiteboard.childNodes.length > 0) {
        var old_video = whiteboard.childNodes[0];
        var elem = document.getElementsByClassName(old_video.id)[0];
        elem.appendChild(old_video);
        elem.childNodes[0].play();
      }

      var video = document.getElementById(id);
      whiteboard.innerHTML = '';
      whiteboard.appendChild(video);
      whiteboard.childNodes[0].play();
    };

    $scope.$on('new-user', function(data) {
      var log = data || 'heya';
      console.log(log);
    });

    $scope.$on('$destroy', function() {
      $interval.cancel(userCheck);
    });

  }])
  .directive('omMeeting', function() {
    return {
      restrict: 'E',
      transclude: true,
      template: '<om-whiteboard></om-whiteboard><om-users></om-users><om-chat></om-chat>'
    };
  })
  .directive('omWhiteboard', function() {
    return {
      restrict: 'E',
      template: '<div id="whiteboard"></div>'
    };
  })
  .directive('omUsers', function() {
    return {
      restrict: 'E',
      template: '<ul class="users"><li class="{{user}}" ng-click="attachToWhiteboard(user)" ng-repeat="user in meeting.users"><video id="{{user}}" autoplay></li></ul>',
    };
  })
  .directive('omChat', function() {
    return {
      restrict: 'E',
      template: '<ul class="chat"><li ng-repeat="chat in meeting.chat">{{chat.name}}: {{chat.message}}</li></ul>'
    };
  });
  