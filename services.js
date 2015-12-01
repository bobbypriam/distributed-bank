var services = module.exports = {};

/**
 * Handler for ping request.
 * @return {{pingReturn: Number}} The return value of ping call.
 */
services.ping = function () {
  return { pingReturn: 1 };
};
