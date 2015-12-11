const async = require('async');
const soap = require('soap');
const utils = require('./utils')();

module.exports = function (models) {
  var services = {};

  function processRequestMessage(message) {
    var processed = {};

    for (var attr in message) {
      if (message.hasOwnProperty(attr)) {
        // PHP generated message
        if (message[attr].$value) {
          processed[attr] = message[attr].$value;

        // Node.JS node-soap generated message
        } else if (typeof message[attr] == 'string' ||
                   typeof message[attr] == 'number') {
          processed[attr] = message[attr];
        }
      }
    }

    return processed;
  }

  function minQuorum(min, successCallback, errorCallback) {
    console.log('Checking minimum quorum', min);
    utils.getQuorum((err, statuses) => {
      const total = statuses.reduce((e, v) => e + v);
      if (total >= min) {
        console.log('Quorum fulfilled');
        successCallback();
      } else {
        console.log('Error: Quorum unfulfilled');
        errorCallback();
      }
    });
  }

  /**
   * Handler for ping request.
   *
   * @return {{pingReturn: Number}} The return value of ping call.
   */
  services.ping = function () {
    console.log('Got ping request');
    return { pingReturn: 1 };
  };

  /**
   * Register a user.
   *
   * @param  {Object} user              Information of the user
   * @param  {Object} user.user_id      User's id
   * @param  {Object} user.nama         User's name
   * @param  {Object} user.ip_domisili  User's IP address
   */
  services.register = function (user) {
    user = processRequestMessage(user);
    console.log('Got register request for user', user);

    minQuorum(5, () => {
      console.log('Proceeding register');
      models.User.findOne(user)
        .then(existing => {
          if (!existing) {
            console.log('Creating new user');
            const newUser = new models.User(user);
            newUser.saldo = 0;
            newUser.save();
          }
        });
    }, () => {
      console.log('Cancelling register');
    });
  };

  /**
   * Get a user's balance
   *
   * @param  {Object}   user                Information of the user
   * @param  {Object}   user.user_id        User's id
   * @param  {Function} callback            The callback function, receives the response object
   * @return {{getSaldoReturn: Number}}     The user's balance (or -1 if user not found)
   */
  services.getSaldo = function (user, callback) {
    user = processRequestMessage(user);
    console.log('Got getSaldo request for user', user);

    minQuorum(5, () => {
      console.log('Proceeding getSaldo');
      models.User.findOne(user)
        .then(userData => {
          if (!userData) {
            console.log('User not found');
            callback(null, { getSaldoReturn: -1 });
          } else {
            console.log('User found');
            callback(null, { getSaldoReturn: userData.saldo });
          }
        });
    }, () => {
      console.log('Cancelling get saldo');
      callback('Quorum unfulfilled');
    });
  };

  /**
   * Simulate transfer.
   *
   * @param  {Object}   user                Information of the user
   * @param  {Object}   user.user_id        User's id
   * @param  {Function} callback            The callback function, receives the response object
   * @return {{transferReturn: Number}}     Transfer status, 0 if success and -1 if failed
   */
  services.transfer = function (user, callback) {
    user = processRequestMessage(user);
    console.log('Got transfer request for user', user);

    minQuorum(5, () => {
      console.log('Proceeding transfer');
      models.User.findOne({ user_id: user.user_id })
        .then(userData => {
          if (userData) {
            console.log('User found');
            userData.saldo += Number(user.nilai);
            userData.save()
              .then(() => {
                callback(null, { transferReturn: 0 });
              });
          } else {
            console.log('User not found');
            callback(null, { transferReturn: -1 });
          }
        });
    }, () => {
      console.log('Cancelling transfer');
      callback('Quorum unfulfilled');
    });
  };

  /**
   * getTotalSaldo.
   *
   * @param  {Object}   user                  Information of the user
   * @param  {Object}   user.user_id          User's id
   * @param  {Function} callback              The callback function, receives the response object
   * @return {{getTotalSaldoReturn: Number}}  Total Saldo, or -1 if failed
   */
  services.getTotalSaldo = function (user, callback) {
    user = processRequestMessage(user);
    console.log('Got getTotalSaldo request for user', user);

    // minQuorum(8, () => {
      console.log('Proceeding getTotalSaldo');
      models.User.findOne({ user_id: user.user_id })
        .then(userData => {
          if (!userData) {
            console.log('User not found');
            return callback(null, { getTotalSaldoReturn: -1 });
          }

          console.log('User found');
          if (userData.ip_domisili == 'https://priambodo.sisdis.ui.ac.id/bank/wsdl') {
            console.log('On this server');
            async.map(
              utils.quorum,
              (wsdl, callback) => {
                console.log(`Creating client for ${wsdl}`);
                soap.createClient(wsdl, (err, client) => {
                  if (err) return callback(null, 0);

                  console.log(`Calling getSaldo from ${wsdl}`);
                  client.getSaldo({ user_id: userData.user_id }, (err, response) => {
                    if (err) return callback(null, 0);

                    console.log(`Calculating balance from ${wsdl}`);
                    const balance = typeof response.getSaldoReturn.$value == 'number' ?
                        response.getSaldoReturn.$value : response.getSaldoReturn;

                    console.log(`Done from ${wsdl}. Balance: ${balance}`);

                    if (balance < 0) {
                      return callback(null, 0);
                    }

                    callback(null, balance);
                  });
                });
              },
              (err, results) => {
                if (err) return callback(err);
                const total = results.reduce((e, v) => e + v);
                console.log(`Finished. Total: ${total}`);
                callback(null, total);
              }
            );
          } else {
            console.log(`Not on this server. Calling ${userData.ip_domisili}`);
            soap.createClient(userData.ip_domisili, (err, client) => {
              if (err) return callback('Failed on creating client');

              client.getTotalSaldo({ user_id: userData.user_id }, (err, response) => {
                if (err) return callback(`Failed calling getTotalSaldo from ${userData.ip_domisili}`);

                const balance = typeof response.getTotalSaldoReturn.$value == 'number' ?
                        response.getTotalSaldoReturn.$value : response.getTotalSaldoReturn;

                callback(null, { getTotalSaldoReturn: balance });
              });
            });
          }
        });
    // }, () => {
    //   console.log('Cancelling getTotalSaldo');
    //   callback('Quorum unfulfilled');
    // });
  };

  return services;
};
