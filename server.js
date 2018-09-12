var express = require('express');
var bodyParser = require('body-parser');
var ocrSDK = require('./ocrsdk.js');
var request = require('request');
var xml2js = require('xml2js');

var parser = new xml2js.Parser();
var app = express();
var router = express.Router(); 

var accountId = '5b62fd82dd7d6f10d8c3a0f0';
var accountToken = 'VqJWr6vEW9Ci3b1TayTqolWbJoY=';
var wait_timeout = 5000;

app.use(express.static('public'));

router.post('/', function (req, res) {
	req.setTimeout(120000);
	res.setTimeout(120000);
	ocrSendFile(req.body.image, function(success, result) {
		if (success) {
			res.json(result);
		}
		else
			res.json({ firstName: 'FAILED', lastName: 'FAILED' });
	});
//	res.json({ firstName: 'Alex', lastName: 'Chuprov' }); 
});

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/views/index.html');
});

app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use('/ocr', router)

var port = 8080;
var ip = '0.0.0.0';
 
var server = app.listen(port, ip, function () {
	console.log("Listening on " + ip + ", port " + port)
});
server.setTimeout(120000);

function ocrSendFile(image, callback) {
	const formData = {
		exampleImage: {
			value: Buffer.from(image.split(",")[1], "base64"),
			options: {
				filename: "example-image.jpg",
				contentType: "image/jpeg"
			}
		}
	};

	const postOptions = {
		url: "https://api.flexicapture.com/v1/file?email=ASChuprov@sberbank.ru",
		headers: {
			'authorization': 'Basic ' + new Buffer(accountId + ':' + accountToken).toString("base64"),
			'accept': 'application/json, text/json'
		},
		formData
	};

	request.post(postOptions, function (error, response, body) {
//		console.log('Response: ' + body);
		var respdata = JSON.parse(body);
		ocrStartTask(respdata[0].id, respdata[0].token, callback);
	});
}

function ocrStartTask(id, token, callback) {
	console.log('Starting task: ' + id + ' : ' + token);
	body = {
		"properties": {},
		"export_format": "xml",
		"verification_type": "NoVerification",
		"email": "ASChuprov@sberbank.ru",
		"label": "Passport",
		"files": [
			{
				"id": id,
				"token": token
			}
		]
	}
//	console.log("AccountID: " + accountId);
	const postOptions = {
		url: "https://api.flexicapture.com/v1/capture/data",
		headers: {
			'authorization': 'Basic ' + new Buffer(accountId + ':' + accountToken).toString("base64"),
			'accept': 'application/json, text/json',
			'content-type': 'application/json'
		},
		body: JSON.stringify(body)
	};

	request.post(postOptions, function (error, response, body) {
//		console.log('Response at start task: ' + body);
		var respdata = JSON.parse(body);
		setTimeout(WaitForResult, wait_timeout, respdata.id, callback);
	});
}

function WaitForResult(id, callback) {
	console.log('WaitForResult started');

	const postOptions = {
		url: "https://api.flexicapture.com/v1/task/" + id,
		headers: {
			'authorization': 'Basic ' + new Buffer(accountId + ':' + accountToken).toString("base64"),
			'accept': 'application/json, text/json',
			'content-type': 'application/json'
		}
	};

	request.get(postOptions, function (error, response, body) {
//		console.log('Received task status: ' + body);
		var respdata = JSON.parse(body);
		switch (respdata.status) {
			case 'Done':
//				console.log('ITS DONE! ' + respdata.services[0].files[0]);
				// Extracting results
				DownloadResult(respdata.services[0].files.target.id, respdata.services[0].files.target.token, callback)
				break;

			case 'Failed':
				console.log('Failed :(');
				callback(false, null);
				break;

			default:
				console.log('Received status: ' + respdata.status);
				console.log('Waiting again...');
				setTimeout(WaitForResult, wait_timeout, respdata.id, callback);
				break;
		}
	});
}

function DownloadResult(id, token, callback) {
//	console.log('Downloading result...');
	const postOptions = {
		url: "https://api.flexicapture.com/v1/file/" + id + '/' + token,
		headers: {
			'authorization': 'Basic ' + new Buffer(accountId + ':' + accountToken).toString("base64"),
			'accept': 'application/json, text/json',
			'content-type': 'application/json'
		}
	};
	request.get(postOptions, function (error, response, body) {
		console.log('Downloaded result');
		parser.parseString(body, function (err, result) {
			console.log('Extracted: ' + JSON.stringify(result['form:Documents']));
			var passdata = result['form:Documents']['_Паспорт_РФ:_Паспорт_РФ1'][0]; 
			callback(true, { 
				lastName:   getValue(passdata, '_PP_SurName'),
				firstName:  getValue(passdata, '_PP_Name'), 
				midName:    getValue(passdata, '_PP_SecName'),
				birthDate:  getValue(passdata, '_PP_BirthDate'),
				passDate:   getValue(passdata, '_PP_Date'),
				passGiven:  getValue(passdata, '_PP_Kem'),
				passSeria:  getBestNumber(passdata, '_PP_Ser', '_PP_Ser2', 4),
				passNumber: getBestNumber(passdata, '_PP_Num', '_PP_Num2', 6),
			});
		});
	});
}

function getValue(json, field) {
	var item = json[field][0];
	if (item != null && item['_'] != null)
		return item['_'].replace(/[\r\n]+/g," ");
	else
		return "";
}

function getBestNumber(json, f1, f2, length) {
	var val1 = getValue(json, f1).replace(/\s+/g, '');
	var val2 = getValue(json, f2).replace(/\s+/g, '');	
	if (Math.abs(val1.length-length)<=Math.abs(val2.length-length))
		return val1;
	else
		return val2;
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
