//Define express route handlers here

var express = require('express')();

express.use('/', function(req,res){
  res.send('Hello World');
});


module.exports=  express;





