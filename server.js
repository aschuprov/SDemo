var express = require('express');

var app = express();
var router = express.Router(); 

app.use(express.static('public'));

router.post('/', function (req, res) {
  var image = req.body;
  console.log('IMAGE=' + image);
  res.json( { message: 'OCR called', image_bytes: image } );
});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.use('/ocr', router);

var port = 8080;
var ip   = '0.0.0.0';
 
app.listen(port, ip, function () {
  console.log( "Listening on " + ip + ", port " + port )
});