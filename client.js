const https = require('https');
const fs = require('fs');
const soap = require('soap');

// Include root CA
var ca = fs.readFileSync('./CA_Sistem_Terdistribusi_2015.crt');
https.globalAgent.options.ca = [ca];

soap.createClient('https://priambodo.sisdis.ui.ac.id/bank/wsdl', function (err, client) {
  if (err) return console.log(err);
  client.register({ user_id: '1235', nama: 'test', ip_domisili: 'halo' }, (err, response) => {
    if (err) return console.log(err);
    console.log(response);
  });
});
