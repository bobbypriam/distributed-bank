const expect = require('chai').expect;

describe('Kantor Cabang Services', () => {
  describe('ping()', () => {
    it('should return pingReturn with value 1', () => {
      const services = require('./services')({});
      const result = services.ping();
      expect(result).to.be.ok;
      expect(result).to.deep.equal({ pingReturn: 1 });
    });
  });

  describe('register()', () => {
    it('should create new customer');
  });

  describe('getSaldo()', () => {
    it('should return customer\'s balance if customer exists');
    it('should return -1 if customer does not exist');
  });

  describe('transfer()', () => {
    it('should error if amount > balance');
    it('should decrement balance with amount if transfer success');
    it('should not decrement balance if transfer failed');
  });
});
