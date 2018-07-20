var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var router = express.Router(); 

app.use(express.static('public'));

router.post('/', function (req, res) {
  var image = req.body;
  res.json( { firstName: 'Alex', lastName: 'Chuprov' } );
});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.use(bodyParser.json());
app.use('/ocr', router);

var port = 8080;
var ip   = '0.0.0.0';
 
app.listen(port, ip, function () {
  console.log( "Listening on " + ip + ", port " + port )
});