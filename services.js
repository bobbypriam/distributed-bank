var services = {
  KantorCabang: {
    KantorCabangPort: {
      ping: ping
    }
  }
};

module.exports = services;

// SERVICE DEFINITIONS
function ping() {
  return { pong: 1 };
}
