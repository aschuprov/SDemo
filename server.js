var express = require('express');
var bodyParser = require('body-parser');
var ocrSDK = require('./ocrsdk.js');
var request = require('request');

var app = express();
var router = express.Router(); 

app.use(express.static('public'));

router.post('/', function (req, res) {
  ocr(req.body.image);
  res.json( { firstName: 'Alex', lastName: 'Chuprov' } );
});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.use(bodyParser.urlencoded());
app.use('/ocr', router)

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
	
	var imageBuffer = decodeBase64Image(image);
  ocrAPI.processImage(imageBuffer.data, settings, function(error, taskData) {
    if (error) {
			console.log("Error: " + error.message);
			return;
    }
    
		console.log("Task id = " + taskData.id + ", status is " + taskData.status);
		if (!ocrAPI.isTaskActive(taskData)) {
			console.log("Unexpected task status " + taskData.status);
			return;
		}

		ocrAPI.waitForCompletion(taskData.id, processingCompleted);
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

		ocrAPI.getResult(taskData.resultUrl.toString(), downloadCompleted);
		console.log("Exiting OCR function");
  }
  
  function downloadCompleted(error, data) {
		if (error) {
			console.log("Error: " + error.message);
			return;
		}
		console.log("Done. Received=" + data); 
	}

	function decodeBase64Image(dataString) {
		var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
			response = {};
	
		if (matches.length !== 3) {
			return new Error('Invalid input string');
		}
	
		response.type = matches[1];
		response.data = new Buffer(matches[2], 'base64');
	
		return response;
	}
}