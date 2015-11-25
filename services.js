var services = {
  ping: ping
};

module.exports = services;

// SERVICE DEFINITIONS
function ping() {
  return { pingReturn: 1 };
}
