var express = require('express');
var bodyParser = require('body-parser');
var ocrSDK = require('./ocrsdk.js');
var request = require('request');

var app = express();
var router = express.Router();

app.use(express.static('public'));

router.post('/', function (req, res) {
	//var image = decodeBase64Image(req.body.image);
	ocrSendFile(req.body.image);
	res.json({ firstName: 'Alex', lastName: 'Chuprov' });
});

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/views/index.html');
});

app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use('/ocr', router)

var port = 8080;
var ip = '0.0.0.0';

app.listen(port, ip, function () {
	console.log("Listening on " + ip + ", port " + port)
});

function ocrSendFile(image) {
	var boundary = 'ThisIsTheDelimiter';
	var accountId = '5b62fd82dd7d6f10d8c3a0f0';
	var token = 'VqJWr6vEW9Ci3b1TayTqolWbJoY=';
/*
	body = "--" + boundary + "\r\n";
	body += 'Content-Disposition: form-data; '
		// Define the name of the form data
		+ 'name="0"; '
		// Provide the real name of the file
		+ 'filename="pass.jpg"\r\n';
	// And the MIME type of the file
	body += 'Content-Type: image/jpeg\r\n\r\n';

	var payload = Buffer.concat([
		Buffer.from(body, "utf8"),
		new Buffer(image, 'binary'),
		Buffer.from('\r\n--' + boundary + '\r\n', 'utf8')
	]);

	console.log('Sending: ' + payload);
*/
	const formData = {
		exampleImage: {
			value: Buffer.from(image, "base64"),
			options: {
				filename: "example-image.jpg",
				contentType: "image/jpeg"
			}
		}
	};

	const postOptions = {
		url: "https://api.flexicapture.com/v1/file?email=ASChuprov@sberbank.ru",
		headers: {
			//				'content-type' : 'multipart/form-data; boundary=' + boundary,
			//				'content-length' : image.length,
			'authorization': 'Basic ' + new Buffer(accountId + ':' + token).toString("base64"),
			'accept': 'application/json, text/json'
		},
		formData
	};

	request.post(postOptions, function (error, response, body) {
			console.log('Response: ' + body);
		});
	/*    
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
	
		*/
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
