module.exports = function (models) {
  var services = {};

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
   * @param  {Object} user              Information about the user
   * @param  {Object} user.user_id      User's id
   * @param  {Object} user.nama         User's name
   * @param  {Object} user.ip_domisili  User's IP address
   */
  services.register = function (user) {

  };

  return services;
};
