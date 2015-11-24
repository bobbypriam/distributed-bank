var fs = require('fs');
var http = require('http');
var soap = require('soap');
var express = require('express');

// SOAP service
var xml = fs.readFileSync('service.wsdl', 'utf8');
var services = require('./services');

// Express app
var app = express();

// WSDL specification
app.get('/wsdl', function (req, res) {
  res.set('Content-Type', 'text/xml');
  res.send(xml);
});

var server = http.createServer(app);
server.listen(8888);
soap.listen(server, '/', services, xml);
