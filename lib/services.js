module.exports = function (models) {
  var services = {};

  function processRequestMessage(message) {
    var processed = {};

    for (var attr in message)
      if (message.hasOwnProperty(attr) && message[attr].$value)
        processed[attr] = message[attr].$value;

    return processed;
  }

  /**
   * Handler for ping request.
   *
   * @return {{pingReturn: Number}} The return value of ping call.
   */
  services.ping = function () {
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
    models.User.findOne(user)
      .then(existing => {
        if (!existing) {
          const newUser = new models.User(user);
          // Initial balance is Rp 1.000.000,-
          newUser.saldo = 1000000;
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
   * @return {{getSaldoReturn: Number}}   The user's balance (or -1 if user not found)
   */
  services.getSaldo = function (user, callback) {
    user = processRequestMessage(user);
    models.User.findOne(user)
      .then(userData => {
        if (!userData) {
          callback(null, { getSaldoReturn: -1 });
        } else {
          callback(null, { getSaldoReturn: userData.saldo });
        }
      });
  };

  services.transfer = function (user, callback) {
    user = processRequestMessage(user);
    models.User.findOne({ user_id: user.user_id })
      .then(userData => {
        if (userData) {
          userData.saldo += Number(user.nilai);
          userData.save()
            .then(() => {
              callback(null, { transferReturn: 0 });
            });
        } else {
          callback(null, { transferReturn: -1 });
        }
      });
  };

  return services;
};
