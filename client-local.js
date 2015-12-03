const https = require('https');
const fs = require('fs');
const soap = require('soap');

// Include root CA
// var ca = fs.readFileSync('./CA_Sistem_Terdistribusi_2015.crt');
// https.globalAgent.options.ca = [ca];
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

soap.createClient('https://sisdis.local/wsdl', function (err, client) {
  if (err) return console.log(err);

  // register
  // client.register({ user_id: '1206208315', nama: 'Widyanto Bagus Priambodo', ip_domisili: 'https://priambodo.sisdis.ui.ac.id' }, (err, response) => {
  //   if (err) return console.log(err);
  //   console.log(response);
  // });

  // transfer
  client.transfer({ user_id: '1206208315', nilai: '1000' }, (err, response) => {
    if (err) return console.log(err);
    console.log(response);

    // getSaldo
    client.getSaldo({ user_id: '1206208315' }, function (err, response) {
      if (err) return console.log(err);
      console.log(response);
    });
  });

  // ping
  // client.ping(null, function (err, response) {
  //   if (err) return console.log(err);
  //   console.log(response);
  // });
});
