const fs = require('fs');
const https = require('https');
const async = require('async');
const soap = require('soap');

const ca = fs.readFileSync('./CA_Sistem_Terdistribusi_2015.crt');
https.globalAgent.options.ca = [ca];

module.exports = function () {
  var utils = {};

  utils.quorum = [
    'https://priambodo.sisdis.ui.ac.id/bank/wsdl',
    'https://oenang.sisdis.ui.ac.id/bank/wsdl',
    'https://ahlunaza.sisdis.ui.ac.id/tugasakhir.wsdl',
    'https://nabilati.sisdis.ui.ac.id/ta/wsdl',
    'https://rahmat.sisdis.ui.ac.id/ta/service.wsdl',
    'https://bank.cakra.sisdis.ui.ac.id/spesifikasi.wsdl',
    'https://vidyan.sisdis.ui.ac.id/bank/service.wsdl',
    'https://bank.aini.sisdis.ui.ac.id/spek.wsdl'
  ];

  utils.getQuorum = function (callback) {
    function ping(wsdl, callback) {
      soap.createClient(wsdl, (err, client) => {
        if (err) return callback(null, 0);

        client.ping(null, (err, response) => {
          if (err) return callback(null, 0);
          callback(null, (response.pingReturn.$value || response.pingReturn));
        });
      });
    }

    async.map(this.quorum, ping, (err, results) => {
      if (err) return callback(err);
      callback(null, results);
    });
  };

  return utils;
};
