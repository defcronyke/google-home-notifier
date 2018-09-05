require('log-timestamp');
var expect = require('expect.js');

var googlehome = require('../google-home-notifier');
var deviceName = 'Google Home';
var deviceAddress = '192.168.1.4';

describe('google-home-notifier library test', function() {
  this.timeout(10000);

  it('device name should be supplied before notify/play', function(done) {
    googlehome.notify('notify no.1', (notifyRes) => {
      expect(notifyRes).to.be(undefined);
      setTimeout(done, 1000);
    });
  });
  it('Invalid device name', function(done) {

    googlehome.device('InvalidName')
    googlehome.notify('Invalid device name', (notifyRes) => {
      expect(notifyRes).to.be(undefined);
      setTimeout(() => {
        googlehome.notify('Second search of Google Home', (notifyRes) => {
          expect(notifyRes).to.be(undefined);
          setTimeout(done, 1000);
        });
      }, 1000);
    });
  });

  it('device name is supplied', function(done) {
    googlehome.device(deviceName)
      .language('ja')
      .notify('device name is supplied', (notifyRes) => {
        expect(notifyRes).not.to.be(undefined);
        setTimeout(done, 3000);
      });
  });

  it('ip address is supplied', function(done) {
    googlehome.ip(deviceAddress)
      .language('ja')
      .notify('ip address is supplied', (notifyRes) => {
        expect(notifyRes).not.to.be(undefined);
        setTimeout(done, 3000);
      });
  });
 
  it('invalid timeout value should be ignored', function(done) {
    googlehome.timeout('aaa')
      .notify('invalid timeout value', (notifyRes) => {
        expect(notifyRes).not.to.be(undefined);
        setTimeout(done, 3000);
      });
  });

  if('invalid speed value should be ignored', function(done) {
    googlehome.speed('bbb')
      .notify('invalid speed value', (notifyRes) => {
        expect(notifyRes).not.to.be(undefined);
        setTimeout(done, 3000);
      });
  });

  if('invalid volume value should be ignored', function(done) {
    googlehome.volume('ccc')
      .notify('invalid volume value', (notifyRes) => {
        expect(notifyRes).not.to.be(undefined);
        setTimeout(done, 3000);
      });
  });
    
});
