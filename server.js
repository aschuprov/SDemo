var express = require('express');

var app = express();
app.get('/', function (req, res) {
  res.send('Hello world!');
});

var port = 8080;
var ip   = '0.0.0.0';
 
app.listen(port, ip, function () {
  console.log( "Listening on " + ip + ", port " + port )
});