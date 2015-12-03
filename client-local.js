const https = require('https');
const fs = require('fs');
const soap = require('soap');

// Include root CA
// var ca = fs.readFileSync('./CA_Sistem_Terdistribusi_2015.crt');
// https.globalAgent.options.ca = [ca];
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

soap.createClient('https://sisdis.local/wsdl', function (err, client) {
  if (err) return console.log(err);
  client.register({ user_id: '4321', nama: 'test', ip_domisili: '32323' }, (err, response) => {
    if (err) return console.log(err);
    console.log(response);
  });
});
