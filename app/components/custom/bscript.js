    /* temps */
    var userList = ['justin', 'max', 'rob'];

    var whiteboard = document.getElementById('whiteboard');
    var ratio = 4 / 3;

    function dynamicSize() {
      var meeting = document.getElementsByClassName('meeting')[0];

      if (whiteboard.childNodes.length > 0) {
        whiteboard.childNodes[0].style.height = (meeting.clientHeight - 146) + 'px';

        if ((whiteboard.clientWidth / whiteboard.clientHeight) < ratio) {
          // height = (3 * width) / 4 // keeps the video at a 4:3 ratio
          whiteboard.childNodes[0].style.height = (3 * whiteboard.clientWidth) / 4;
        }
      }



      document.getElementById('whiteboard').style.height = (meeting.clientHeight - 143) + 'px';
    }

    function dynamicUserSize() {
      var meeting = document.getElementsByClassName('meeting')[0];
      var meetingWidth = meeting.clientWidth;
      var userlist = document.getElementById('user-list');
      var children = userlist.childNodes;
      var runningTotal = 0;

      for (var i = 1; i < children.length; i = i + 2) {
        runningTotal += children[i].clientWidth;
      }

      if (runningTotal > meetingWidth) {
        for (var j = 1; j < children.length; j = j + 2) {
          // doesn't work cause style.width doesn't change anything, need to find a workaround for it
          children[j].style.width = meetingWidth / (children.length / 2);
        }
      }
    }

    function toggleUserList() {
      var invites = document.getElementById('invites');
      var meeting = document.getElementsByClassName('meeting')[0];
      // meeting stuff is a WIP
      if (invites.className === 'hidden') {
        invites.className = '';
        // meeting.className = 'meeting';
      } else {
        invites.className = 'hidden';
        // meeting.className = 'meeting slide';
      }
    }

    dynamicSize();
    window.onresize = function() {
      dynamicSize();
      dynamicUserSize();
    };

    document.getElementById('user-list').addEventListener('click', function(event) {
      var meeting = document.getElementsByClassName('meeting')[0];

      // retrieve an event if it was called manually
      event = event || window.event;

      // retrieve the related element
      var el = event.target || event.srcElement;

      if (el.tagName === 'VIDEO' && el.parentNode.id !== 'my-video') {
        // Create temp element to hold video location
        var holder = document.createElement('div');
        holder.className = el.id + ' user-div';

        el.parentNode.insertBefore(holder, el);

        if (whiteboard.childNodes.length > 0) {
          whiteboard.childNodes[0].style.height = '125px';
          var oldVideo = whiteboard.childNodes[0];
          var elem = document.getElementsByClassName(oldVideo.id)[0];
          elem.parentNode.insertBefore(oldVideo, elem);
          oldVideo.play();
          elem.parentNode.removeChild(elem);
        }

        whiteboard.appendChild(el);
        whiteboard.childNodes[0].play();
        whiteboard.childNodes[0].style.height = (meeting.clientHeight - 146) + 'px';
      }
    }, false);

  //var socket = io.connect('/');
  var client;
  var start = function(namespace, info){
    client = io.connect(namespace);
    client.send = client.emit.bind(client);

    var om = OurMeeting(client);

    return om;
  };

  //Get username
  var info = (function(){
    return {
      username: prompt('Please enter a username')
    };
  })();


  ourMeeting = start('/manager', info);
    //send user info to server
  client.emit('user-ready', info);

  var user = ourMeeting.currentUser(info.username);
  user.el = document.querySelector('#my-video > video');
  signalling(user.getWebRTC());
  //Keep the list of users up to date
  var usersElem = document.getElementById('users');

  var onNewUsers = function(userlist){
    var users = ourMeeting.users = userlist;
    usersElem.innerHTML = '';
    users.forEach(function(user){
      var li = document.createElement('li');
      li.innerHTML = '' + user;
      li.id = user;
      usersElem.appendChild(li);
    });
  };

  client.on('updateList', onNewUsers);



  //Element creation helper function
  var peerVideo = function(id){
    var elem = document.createElement('video');
    elem.id = id;
    elem.autoplay = true;
    document.getElementById('user-list')
      .appendChild(elem);
    return elem;
  };

  //Functions that control local users video
  //Set as onclick handlers for buttons

  var joinMeeting = function(room){
    user.joinMeeting(room);
    document.getElementsByClassName('meeting')[0].hidden = false;
    document.getElementById('info').hidden = true;
    return user.meeting;
  };

  var meeting;

  var onMeetingClick = function(elem){
    elem.addEventListener('click', function(event){
        var room = this.id;
        meeting = joinMeeting(room);
        console.log('click');
    });
  };

  var inviteElem = document.getElementById('meeting-list');
  client.on('inviteList', function(meetings){
    var inv = user.invites = meetings;
    console.log(inv);
    inv.forEach(function(meeting){
      var li = document.createElement('li');
      li.innerHTML = '' + meeting;
      li.id = meeting;
      inviteElem.appendChild(li);
      onMeetingClick(li);
    });
  });

  var muteState = false;

  var toggleMute = function(){
    var controls = user.getStreamControls();
    if(controls === undefined){
      return;
    }
    if(muteState){
      controls.unmute();
      muteState = false;
    } else {
      controls.mute();
      muteState = true;
    }
  };

  var videoState = false;

  var toggleVideo = function(){
    var controls = user.getStreamControls();
    if(controls === undefined){
      return;
    }
    if(videoState){
      controls.resumeVideo();
      videoState = false;
    } else {
      controls.pauseVideo();
      videoState = true;
    }
  };

  //Stream Events
  //These events help regulate the dom and show video elements

  //Local Stream
  user.on('LocalStreamAdded', function(stream){
    var elem = document.querySelector('#my-video > video');
    attachMediaStream(elem, stream);
    elem.hidden = false;
    user.el = elem;
  });

  user.on('LocalStreamStopped', function(){
    user.el.remove();
  });

  //Remote Stream
  user.on('PeerStreamAdded', function(peer){
    var elem = peerVideo(peer.id);
    var stream = peer.stream;
    attachMediaStream(elem, stream);
    peer.el = elem;
  });

//SIGNALLING
function signalling(webrtc){
  client.on('new-peer', webrtc.newPeer.bind(webrtc.RTC()));

  client.on('signal', function(data){
    webrtc.RTC().handlers.sig(data);
  });

  client.on('peer-disconnect', function(data){
    console.log('disco', data.id);
    var id = data.id;
    webrtc.removePeer(id);
  });


  webrtc.on('message', function(message){
    client.emit('signal', message);
  });

  webrtc.on('PeerStreamRemoved', function(peer){
    if(peer.el){
      peer.el.remove();
    }
  });
  webrtc.on('PeerDataMessage', function(){
    console.log(arguments);
  });
}
