var fs = require('fs');
var http = require('http');
var soap = require('soap');
var express = require('express');

// SOAP service
var services = require('./services');
var KantorCabangService = { KantorCabang: { KantorCabangPort: services } };

// Express app
var app = express();

// WSDL specification
var xml = fs.readFileSync('service.wsdl', 'utf8');
app.get('/wsdl', function (req, res) {
  res.set('Content-Type', 'text/xml');
  res.send(xml);
});

var server = http.createServer(app);
server.listen(8888);
soap.listen(server, '/', KantorCabangService, xml);
