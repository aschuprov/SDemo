var express = require('express');

var app = express();
app.get('/', function (req, res) {
  res.send('Hello World!');
});

var port = process.env.PORT || process.env.SDEMO_SERVICE_PORT || 8080;
var ip   = process.env.IP   || process.env.SDEMO_SERVICE_HOST || '0.0.0.0';
 
app.listen(port, ip, function () {
  console.log( "Listening on " + ip + ", port " + port )
});