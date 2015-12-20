const async = require('async');
const soap = require('soap');
const utils = require('./utils')();

module.exports = function (models) {
  var services = {};

  var quorumUnfulfilledFault = {
    Fault: {
      Reason: { Text: 'Quorum unfulfilled' }
    }
  };

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
    console.log(`[minQuorum] Checking minimum quorum of ${min}...`);
    utils.getQuorum((err, statuses) => {
      const total = statuses.reduce((e, v) => e + v);
      if (total >= min) {
        console.log('[minQuorum] Quorum fulfilled,', total, 'of', statuses.length, 'active.');
        successCallback();
      } else {
        console.error('[minQuorum] Error: Quorum unfulfilled,', total, 'of', statuses.length, 'active.');
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
    console.log('[ping] Got ping request.');
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
    console.log('[register] Got register request for user', user);

    minQuorum(5, () => {
      console.log('[register] Proceeding register...');
      models.User.findOne(user)
        .then(existing => {
          if (!existing) {
            console.log('[register] Creating new user...');
            const newUser = new models.User(user);
            newUser.saldo = 0;
            newUser.save()
              .then(() => {
                console.log('[register] New user created.');
              });
          }
        });
    }, () => {
      console.log('[register] Cancelling register.');
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
    console.log('[getSaldo] Got getSaldo request for user', user);

    minQuorum(5, () => {
      console.log('[getSaldo] Proceeding getSaldo...');
      models.User.findOne(user)
        .then(userData => {
          if (!userData) {
            console.log('[getSaldo] User not found. Returning -1.');
            callback(null, { getSaldoReturn: -1 });
          } else {
            console.log(`[getSaldo] User found. Saldo is ${userData.saldo}.`);
            callback(null, { getSaldoReturn: userData.saldo });
          }
        });
    }, () => {
      console.log('[getSaldo] Cancelling get saldo.');
      callback(quorumUnfulfilledFault);
    });
  };

  /**
   * Simulate transfer.
   *
   * @param  {Object}   user                Information of the user
   * @param  {Object}   user.user_id        User's id
   * @param  {Object}   user.nilai          The transfer amount
   * @param  {Function} callback            The callback function, receives the response object
   * @return {{transferReturn: Number}}     Transfer status, 0 if success and -1 if failed
   */
  services.transfer = function (user, callback) {
    user = processRequestMessage(user);
    console.log('[transfer] Got transfer request for user', user);

    minQuorum(5, () => {
      console.log('[transfer] Proceeding transfer...');
      models.User.findOne({ user_id: user.user_id })
        .then(userData => {
          if (userData) {
            console.log('[transfer] User found. Adding nilai to saldo...');
            userData.saldo += Number(user.nilai);
            userData.save()
              .then(() => {
                console.log(`[transfer] Done. Saldo is now ${userData.saldo}.`);
                callback(null, { transferReturn: 0 });
              });
          } else {
            console.log('[transfer] User not found. Returning -1.');
            callback(null, { transferReturn: -1 });
          }
        });
    }, () => {
      console.log('[transfer] Cancelling transfer.');
      callback(quorumUnfulfilledFault);
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
    console.log('[getTotalSaldo] Got getTotalSaldo request for user', user);

    minQuorum(8, () => {
      console.log('[getTotalSaldo] Proceeding getTotalSaldo...');
      models.User.findOne({ user_id: user.user_id })
        .then(userData => {
          if (!userData) {
            console.log('[getTotalSaldo] User not found. Returning -1.');
            return callback(null, { getTotalSaldoReturn: -1 });
          }

          console.log('[getTotalSaldo] User found. Checking ip_domisili...');
          if (userData.ip_domisili == 'https://priambodo.sisdis.ui.ac.id/bank/wsdl') {
            console.log('[getTotalSaldo] On this server. Calling get saldo from quorums...');
            async.map(
              utils.quorum,
              (wsdl, callback) => {
                console.log(`[getTotalSaldo] Creating client for ${wsdl}...`);
                soap.createClient(wsdl, (err, client) => {
                  if (err) return callback(null, 0);

                  console.log(`[getTotalSaldo] Calling getSaldo from ${wsdl}...`);
                  client.getSaldo({ user_id: userData.user_id }, (err, response) => {
                    if (err) return callback(null, 0);

                    console.log(`[getTotalSaldo] Calculating balance from ${wsdl}...`);
                    const balance = typeof response.getSaldoReturn.$value == 'number' ?
                        response.getSaldoReturn.$value : response.getSaldoReturn;

                    console.log(`[getTotalSaldo] Done from ${wsdl}. Balance: ${balance}.`);

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
                console.log(`[getTotalSaldo] Finished. Total: ${total}.`);
                callback(null, { getTotalSaldoReturn: total });
              }
            );
          } else {
            console.log(`[getTotalSaldo] Not on this server. Calling ${userData.ip_domisili}...`);
            soap.createClient(userData.ip_domisili, (err, client) => {
              if (err) {
                console.error('[getTotalSaldo] Failed on creating client.', err);
                return callback('Failed on creating client');
              }

              console.log(`[getTotalSaldo] Calling getTotalSaldo on ${userData.ip_domisili}...`);
              client.getTotalSaldo({ user_id: userData.user_id }, (err, response) => {
                if (err) {
                  console.error(`[getTotalSaldo] Failed calling getTotalSaldo from ${userData.ip_domisili}`);
                  return callback(`Failed calling getTotalSaldo from ${userData.ip_domisili}`);
                }

                console.log(`[getTotalSaldo] Calculating balance on ${userData.ip_domisili}.`);
                const balance = typeof response.getTotalSaldoReturn.$value == 'number' ?
                        response.getTotalSaldoReturn.$value : response.getTotalSaldoReturn;

                console.log(`[getTotalSaldo] Done. balance on ${userData.ip_domisili}: ${balance}.`);
                callback(null, { getTotalSaldoReturn: balance });
              });
            });
          }
        });
    }, () => {
      console.log('[getTotalSaldo] Cancelling getTotalSaldo.');
      callback(quorumUnfulfilledFault);
    });
  };

  return services;
};
