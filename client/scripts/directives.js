angular.module('ourMeeting', [])
  .controller('ourMeetingCtrl', ['$scope', function($scope) {
    $scope.meeting = {
      users: [{name: 'justin'}, {name: 'gabs'}, {name: 'huy'}, {name: 'shawn'}],
      chat: [{name: 'pig', message: 'HELLO EVERYONE!'}, {name: 'cat', message: 'Hey'}, {name: 'pig2', message: 'why do you have to yell'}, {name: 'pig', message: 'sry'}]
    };
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
      template: '<img src="http://media.giphy.com/media/LfbLBInuSRynK/giphy.gif">'
    };
  })
  .directive('omUsers', function() {
    return {
      restrict: 'E',
      controller: function ($scope) {
        $scope.meeting = {
          users: [{name: 'justin'}, {name: 'gabs'}, {name: 'huy'}, {name: 'shawn'}],
          chat: [{name: 'pig', message: 'HELLO EVERYONE!'}, {name: 'cat', message: 'Hey'}, {name: 'pig2', message: 'why do you have to yell'}, {name: 'pig', message: 'sry'}]
        };
      },
      template: '<ul id="users"><li ng-repeat="user in meeting.users">{{user.name}}</li></ul>',
    };
  })
  .directive('omChat', function() {
    return {
      restrict: 'E',
      template: '<ul id="users"><li ng-repeat="chat in meeting.chat">{{chat.name}}: {{chat.message}}</li></ul>'
    };
  });