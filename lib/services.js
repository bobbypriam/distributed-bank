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
    models.User.findOne(user)
      .then(existing => {
        if (!existing) {
          console.log('Creating new user');
          const newUser = new models.User(user);
          newUser.saldo = 0;
          newUser.save();
        }
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
  };

  /**
   * Simulate transfer
   *
   * @param  {Object}   user                Information of the user
   * @param  {Object}   user.user_id        User's id
   * @param  {Function} callback            The callback function, receives the response object
   * @return {{transferReturn: Number}}     Transfer status, 0 if success and -1 if failed
   */
  services.transfer = function (user, callback) {
    user = processRequestMessage(user);
    console.log('Got transfer request for user', user);
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
  };

  return services;
};
