//Define express route handlers here

var express = require('express')();
express.get('/', function(req,res){
  res.sendFile(req.url, {root:'./app/components/WebRTC'});
});

express.get('/*', function(req, res){
  res.sendFile(req.url, {root:'./app/components/'});
});
/*
express.get('/', function(req,res){
  res.sendFile('app/components/WebRTC/test.html', {root:'./'});
});*/


module.exports=  express;





