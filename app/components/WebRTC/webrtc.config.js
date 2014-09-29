(function(window){
  var sig = window.ourMeeting.Signaller;
  var rtcConfig = {
    send: function(to, data){
      sig.send('signal', {to:to, info:data});
    },
    onOffer: function(description){

    }
  };
})(window);