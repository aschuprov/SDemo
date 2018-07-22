var express = require('express');
var bodyParser = require('body-parser');
var ocrSDK = require('./ocrsdk.js');
var request = require('request');

var app = express();
var router = express.Router(); 

app.use(express.static('public'));

router.post('/', function (req, res) {
	console.log("Body=" + req.body);
	console.log("BodyStr=" + req.body.toString());
  var image = req.body.image;
  ocr(image);
  res.json( { firstName: 'Alex', lastName: 'Chuprov' } );
});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.use(bodyParser.raw());
app.use('/ocr', router);

var port = 8080;
var ip   = '0.0.0.0';
 
app.listen(port, ip, function () {
  console.log( "Listening on " + ip + ", port " + port )
});
 
function ocr(image) {
  var ocrAPI = ocrSDK.create('SDemoOCR', 'Up0X00Yw8Eo1MzGRPQa1vvZt');
  ocrAPI.serverUrl = 'http://cloud.ocrsdk.com';
  var settings = new ocrSDK.ProcessingSettings();
  settings.language = "Russian";
  settings.exportFormat = "xml";
  settings.profile = "textExtraction";
  
	console.log("Calling processImage");
	console.log("Image=[" + image + "]");
	return;
  ocrAPI.processImage(image, settings, function(error, taskData) {
    if (error) {
			console.log("Error: " + error.message);
			return;
    }
    
		console.log("Task id = " + taskData.id + ", status is " + taskData.status);
		if (!ocrsdk.isTaskActive(taskData)) {
			console.log("Unexpected task status " + taskData.status);
			return;
		}

		ocrsdk.waitForCompletion(taskData.id, processingCompleted);
  });

  function processingCompleted(error, taskData) {
		if (error) {
			console.log("Error: " + error.message);
			return;
		}

		if (taskData.status != 'Completed') {
			console.log("Error processing the task.");
			if (taskData.error) {
				console.log("Message: " + taskData.error);
			}
			return;
		}

		console.log("Processing completed.");

    var res = ocrsdk.getResult(taskData.resultUrl.toString(), downloadCompleted);
    console.log("res=" + res);
  }
  
  function downloadCompleted(error) {
		if (error) {
			console.log("Error: " + error.message);
			return;
		}
		console.log("Done.");
	}
}