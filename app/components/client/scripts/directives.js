angular.module('ourMeeting', [])
  .controller('ourMeetingCtrl', ['$scope', '$timeout', '$interval', function($scope, $timeout, $interval) {
    $scope.meeting = {
      users: []
      /*[{name: 'justin'}, {name: 'gabs'}, {name: 'huy'}, {name: 'shawn'}],
      chat: [{name: 'pig', message: 'HELLO EVERYONE!'}, {name: 'cat', message: 'Hey'}, {name: 'pig2', message: 'why do you have to yell'}, {name: 'pig', message: 'sry'}]
    */};

    var userCheck = $interval(function() {
      $scope.meeting.users = webrtc.users;
      
      $scope.meeting.users.forEach(function (id, index) {
        $scope.attachVideos(id);
      });
    }, 5000);

    
    //$scope.meeting.users.push(webrtc.getMyInfo().id);
    $scope.meeting.videos = {};

    $scope.attachVideos = function(id) {
      if($scope.meeting.videos[id] === undefined) {
        var user = webrtc.getUserInfo(id);
        if(user !== undefined || user !== null) {
          
          $scope.meeting.videos[id] = user;
          var parent = document.getElementById(id);
          if (attachMediaStream(parent, user.stream) === false) {
            $scope.meeting.videos[id] = undefined;
          }
        }
      }
    };

    $scope.attachToWhiteboard = function (id) {
      var video = document.getElementById(id).cloneNode(true);
      document.getElementById('whiteboard').innerHTML = '';
      document.getElementById('whiteboard').appendChild(video);
    };


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
      template: '<ul class="users"><li ng-click="attachToWhiteboard(user)" ng-repeat="user in meeting.users"><video id="{{user}}" autoplay></li></ul>',
    };
  })
  .directive('omChat', function() {
    return {
      restrict: 'E',
      template: '<ul class="chat"><li ng-repeat="chat in meeting.chat">{{chat.name}}: {{chat.message}}</li></ul>'
    };
  });