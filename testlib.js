require('log-timestamp');
var googlehome = require('./google-home-notifier');
var deviceName = 'Google Home';
var deviceAddress = '192.168.1.4';

var express = require('express');
var app = express();
const serverPort = 8094; // default port

app.listen(serverPort, () => {
});

var sleep = (timeout) => {
    var executor = (resolve, reject) => {
        setTimeout(resolve, timeout);
    };
    return new Promise(executor); 
};

var onRejected = (reason) => {
    console.log('Rejected: %s', reason);
};

var execReq = async () => {
  googlehome.notify('Device name should be supplied', (notifyRes) => {
    console.log('Device name should be supplied: %s',
      (!notifyRes)? 'SUCCESS':'FAIL');
  });

  await sleep(3000).catch(onRejected);

  googlehome.device('InvalidName');
  googlehome.notify('Invalid device name', (notifyRes) => {
    console.log('Invalid device name: %s',  (!notifyRes)? 'SUCCESS':'FAIL');
    setTimeout(() => {
      googlehome.notify('Second search of Google Home', (notifyRes) => {
        console.log('Second search of Google Home: %s',
          (!notifyRes)? 'SUCCESS':'FAIL');
      });
    }, 1000);
  });

  await sleep(5000).catch(onRejected);

  googlehome.ip(deviceAddress)
    .notify('IP address', (notifyRes) => {
      console.log('IP address: %s', (notifyRes)? 'SUCCESS':'FAIL');
    });
    ;

  await sleep(3000).catch(onRejected);

  googlehome.device(deviceName)
    .ip(undefined)
    .language('ja')
    .notify('Device name', (notifyRes) => {
      console.log('Device name: %s', (notifyRes)? 'SUCCESS':'FAIL');
    });

  await sleep(5000).catch(onRejected);

  googlehome.timeout('aaa')
    .notify('Invalid timeout value should be ignored', (notifyRes) => {
      console.log('Invalid timeout value should be ignored: %s',
        (notifyRes)? 'SUCCESS':'FAIL');
    });

  await sleep(3000).catch(onRejected);

  googlehome.speed('bbb')
    .notify('Invalid speed value should be ignored', (notifyRes) => {
      console.log('Invalid speed value should be ignored: %s',
        (notifyRes)? 'SUCCESS':'FAIL');
    });
    
  await sleep(3000).catch(onRejected);

  googlehome.volume('ccc')
    .notify('Invalid volume value should be ignored', (notifyRes) => {
      console.log('Invalid volume value should be ignored: %s',
        (notifyRes)? 'SUCCESS':'FAIL');
    });
};

execReq();
