const expect = require('chai').expect;
const sinon = require('sinon');

const SERVICES_PATH = '../lib/services';

function fakeResolve(expectedResult) {
  return {
    then(callback) {
      callback(expectedResult);
    }
  };
}

describe('Kantor Cabang Services', () => {
  describe('ping()', () => {
    it('should return pingReturn with value 1', () => {
      const services = require(SERVICES_PATH)({});

      const result = services.ping();

      expect(result).to.be.ok;
      expect(result).to.deep.equal({ pingReturn: 1 });
    });
  });

  describe('register()', () => {
    it('should create new customer if not exist', () => {
      const User = (function () {
        function User() {}
        User.prototype.save = sinon.spy();
        User.findOne = sinon.stub().returns(fakeResolve(null));
        return User;
      })();

      const services = require(SERVICES_PATH)({User});
      const user = { user_id: 1, nama: 'Test', ip_domisili: 'https://test.sisdis.ui.ac.id' };

      services.register(user);

      expect(User.prototype.save.calledOnce).to.be.true;
    });

    it('should not create new customer if exists', () => {
      const User = (function () {
        function User() {}
        User.prototype.save = sinon.spy();
        User.findOne = sinon.stub().returns(fakeResolve(true));
        return User;
      })();

      const services = require(SERVICES_PATH)({User});
      const user = { user_id: 1, nama: 'Test', ip_domisili: 'https://test.sisdis.ui.ac.id' };

      services.register(user);

      expect(User.prototype.save.called).to.be.false;
    });
  });

  describe('getSaldo()', () => {
    it('should return customer\'s balance if customer exists', done => {
      const User = (function () {
        function User() {}
        User.findOne = sinon.stub().returns(fakeResolve({ saldo: 100 }));
        return User;
      })();

      const services = require(SERVICES_PATH)({User});
      const user = { user_id: 1 };

      services.getSaldo(user, (err, response) => {
        expect(!err).to.be.ok;
        expect(response).to.be.ok;
        expect(response).to.deep.equal({ getSaldoResponse: 100 });
        done();
      });
    });

    it('should return -1 if customer does not exist', done => {
      const User = (function () {
        function User() {}
        User.findOne = sinon.stub().returns(fakeResolve(null));
        return User;
      })();

      const services = require(SERVICES_PATH)({User});
      const user = { user_id: 1 };

      services.getSaldo(user, (err, response) => {
        expect(!err).to.be.ok;
        expect(response).to.be.ok;
        expect(response).to.deep.equal({ getSaldoResponse: -1 });
        done();
      });
    });
  });

  describe('transfer()', () => {
    it('should error if amount > balance', () => {
      const User = (function () {
        const userModel = {
          saldo: 100
        };

        function User() {}
        User.findOne = sinon.stub().returns(fakeResolve(userModel));
        return User;
      })();

      const services = require(SERVICES_PATH)({User});
      const transferDetail = { user_id: 1, nilai: 200 };
      const spy = sinon.spy(services, 'transfer');

      try {
        services.transfer(transferDetail);
      } catch (e) {}

      expect(spy.threw()).to.be.true;
    });

    it('should decrement balance with amount if transfer success');
    it('should not decrement balance if transfer failed');
  });
});
