var express = require('express');

var app = express();
var router = express.Router(); 

app.use(express.static('public'));

router.post('/', function (req, res) {
  var image = req.body.image;
  res.json( { message: 'OCR called', image : image } );
});

app.use('/ocr', router);

var port = 8080;
var ip   = '0.0.0.0';
 
app.listen(port, ip, function () {
  console.log( "Listening on " + ip + ", port " + port )
});