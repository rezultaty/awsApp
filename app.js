var express = require('express');
var AWS = require('aws-sdk');
var helpers = require('./helpers.js');
var Policy = require('./s3post.js').Policy;
AWS.config.loadFromPath('./config.json');
var s3= new AWS.S3();
var sqs = new AWS.SQS();
var app = express();
var key="aandrzejewski";
var sqsUrl = "https://sqs.us-west-2.amazonaws.com/983680736795/aandrzejewskiSQS";

var policyData = helpers.readJSONFile('policy.json');
var awsConfig = helpers.readJSONFile('config.json');

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

var allImages;

app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
    allImages=[];
    s3.listObjects(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
      else
      {
          for (var item in data.Contents){
              allImages.push(data.Contents[item].Key);
          }
          res.render('index', { title: 'Hey', message: 'Hello there!'});
          allImages.shift();
      }
    });

});

app.post('/delete', function (req, res) {
    console.log("Deleting image: "+req.body.key);
    var parameters = {
      Bucket: 'lab4-weeia', /* required */
      Key: req.body.key
    };
    
    s3.deleteObject(parameters, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else {
           res.send("Image deleted successfully");           // successful response
          console.log("Image deleted successfully");
      }       
    });
});

app.post('/applyFilters', function (req, res) {
    console.log("Applying filters: "+JSON.stringify(req.body));
    var params = {
        MessageBody: JSON.stringify(req.body),
        QueueUrl: sqsUrl
    };
    sqs.sendMessage(params, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else     {
          res.send("Request to SQS sent successfully");
          console.log("Request to SQS sent successfully");           // successful response
      }
    });
});


getImageSignedUrl = function(key){
    var parameters = {
      Bucket: 'lab4-weeia', /* required */
      Key: key
    };
    var url = s3.getSignedUrl('getObject', parameters);
    return url;
}

var server = app.listen(8080, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("App started on: " + host + ":" + port);
});

var policy = new Policy(policyData);

var params = {
  Bucket: 'lab4-weeia', /* required */
  Delimiter: ';',
  Prefix: key
};

listImages = function( arr )
{
    var ret="";
    for (var item in arr){
          ret+= "<tr value=\""+arr[item]+"\"><td><input type=\"radio\" name=\"image\" class=\"image\" value=\""+arr[item]+"\"></td><td><a href=\""+getImageSignedUrl(arr[item])+"\">"+arr[item].replace(key+'/','')+"</a></td><td><a class=\"deleteBtn\" href=\"#\" value=\""+arr[item]+"\">Delete</a></td></tr>"; 
    }
    return ret+"";
}


var fs = require('fs'); // this engine requires the fs module
app.engine('html', function (filePath, options, callback) { // define the template engine
  fs.readFile(filePath, function (err, content) {
    if (err) return callback(new Error(err));
    // this is an extremely simple template engine
    var rendered = content.toString()
	.replace('#allImages#', listImages(allImages))
    .replace('#bucket#', policy.getConditionValueByKey("bucket"))
    .replace('#key#', key)
    .replace('#AWSAccessKeyId#', awsConfig.accessKeyId)
    .replace('#policy#', policy.generateEncodedPolicyDocument())
    .replace('#signature#', policy.generateSignature(awsConfig.secretAccessKey));
    return callback(null, rendered);
  });
});
app.set('views', './views'); // specify the views directory
app.set('view engine', 'html'); // register the template engine