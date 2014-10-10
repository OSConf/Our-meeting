//Define express route handlers here

var express = require('express')();
express.get('/*', function(req,res){
  console.log(req.url);
  res.sendFile(req.url, {root:'./dist'});
});


// express.get('/', function(req,res){
//   res.sendFile('app/components/WebRTC/test.html', {root:'./'});
// });


module.exports=  express;





