var expect = require('chai').expect;
var services = require('./services');

describe('Kantor Cabang Services', function () {
  describe('ping()', function () {
    it('should return pingReturn with value 1', function () {
      var result = services.ping();
      expect(result).to.be.ok;
      expect(result).to.deep.equal({ pingReturn: 1 });
    });
  });
});
