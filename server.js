var express = require('express');

var app = express();
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

var port = 8080;
var ip   = '0.0.0.0';
 
app.listen(port, ip, function () {
  console.log( "Listening on " + ip + ", port " + port )
});