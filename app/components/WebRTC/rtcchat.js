(function(window){
  function ChatSetup(user, chat, store){

    chat.onmessage = function(message){
      var item = {};
      item[user] = message.data;
      store.push(item);
      console.log(message.data);
    };

    chat.onopen = function(evt){
      var item = {};
      item[user] = 'joined the room';
      store.push(item);

    };

    chat.onclose = function(evt){
      var item = {};
      item[user] = 'left the room';
      store.push(item);

    };

    chat.onerror = function(evt){
      var item = {};
      item[user] = evt;
      store.push(item);
      console.log(evt);
    };
    return chat;
  }
  if(window.ourMeeting === undefined){
    window.ourMeeting = {};
  }
  window.ourMeeting.ChatSetup = ChatSetup;
})(window);