module.exports = (function(){
  var obj = {};
  obj.signaller = {
    send:function(){}
  };

  obj.admin = {

  };

  obj.webrtc = function(){
    var evts = [];
    return {
      getMyInfo: function(){
        return {id:0, stream:true};
      },
      streamController: {},
      getPeers: function(){
        return true;
      },
      start: function(){},
      getUser: function(){
        return true;
      },
      getStream: function(){
        return true;
      },
      on: function(evt,cb){
        evts.push({evt:evt, callback:cb});
      },
      evts: evts
    };  
  };

  return obj;
})();
