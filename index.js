const fs = require('fs');
const http = require('http');
const soap = require('soap');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// TODO: require mongoose models.
const models = require('./lib/models');

// SOAP service
const services = require('./lib/services')(models);
const KantorCabangService = { KantorCabang: { KantorCabangPort: services } };

// Express app
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// WSDL specification
const xml = fs.readFileSync('specification.wsdl', 'utf8');
app.get('/wsdl', (req, res) => res.set('Content-Type', 'text/xml').send(xml));

// Client app
const client = require('./lib/client')(models);
app.use(client);

// Initialize database connection
mongoose.connect('mongodb://localhost/bank');

// Start server
const server = http.createServer(app);
const PORT = process.env.PORT || 8888;
server.listen(PORT, () => console.log(`Listening at ${PORT}`));
const soapServer = soap.listen(server, '/', KantorCabangService, xml);

// UNCOMMENT THIS FOR SERVER LOGGING
// soapServer.log = function (type, data) {
//   console.log(type, data);
// };
