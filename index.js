const fs = require('fs');
const http = require('http');
const soap = require('soap');
const express = require('express');
const mongoose = require('mongoose');

// TODO: require mongoose models.
const models = require('./lib/models');

// SOAP service
const services = require('./lib/services')(models);
const KantorCabangService = { KantorCabang: { KantorCabangPort: services } };

// Express app
const app = express();

// WSDL specification
const xml = fs.readFileSync('specification.wsdl', 'utf8');
app.get('/wsdl', (req, res) => res.set('Content-Type', 'text/xml').send(xml));

// Initialize database connection
mongoose.connect('mongodb://localhost/bank');

// Start server
const server = http.createServer(app);
const PORT = process.env.PORT || 8888;
server.listen(PORT, () => console.log(`Listening at ${PORT}`));
const soapServer = soap.listen(server, '/', KantorCabangService, xml);
soapServer.log = function (type, data) {
  console.log(type, data);
};
