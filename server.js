const fs = require('fs');
const http = require('http');
const soap = require('soap');
const express = require('express');

// TODO: require mongoose models.
const models = {};

// SOAP service
const services = require('./services')(models);
const KantorCabangService = { KantorCabang: { KantorCabangPort: services } };

// Express app
const app = express();

// WSDL specification
const xml = fs.readFileSync('service.wsdl', 'utf8');
app.get('/wsdl', (req, res) => res.set('Content-Type', 'text/xml').send(xml));

// Start server
const server = http.createServer(app);
const PORT = process.env.PORT || 8888;
server.listen(PORT, () => console.log(`Listening at ${PORT}`));
soap.listen(server, '/', KantorCabangService, xml);
