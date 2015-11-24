var expect = require('chai').expect;
var port = require('./services').KantorCabang.KantorCabangPort;

describe('Kantor Cabang Services', function () {
  describe('ping()', function () {
    it('should return pong with value 1', function () {
      var result = port.ping();
      expect(result).to.be.ok;
      expect(result).to.deep.equal({ pong: 1 });
    });
  });
});
