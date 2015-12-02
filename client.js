const https = require('https');
const fs = require('fs');
const soap = require('soap');

// Include root CA
var ca = fs.readFileSync('./CA_Sistem_Terdistribusi_2015.crt');
https.globalAgent.options.ca = [ca];

soap.createClient('https://nabilati.sisdis.ui.ac.id/ta/wsdl', function (err, client) {
  console.log(err);
  client.ping(null, (err, response) => {
    console.log(response);
  });
});
