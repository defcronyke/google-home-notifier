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
  // device name should be supplied before notify/play
  googlehome.notify('notify no.1', (notifyRes) => {
    console.log('notify no.1: ' + notifyRes);
  });

  await sleep(3000).catch(onRejected);

  // No error if invalid device name is supplied
  googlehome.device('InvalidName', 'en')
  googlehome.notify('notify no.2', (notifyRes) => {
    console.log('notify no.2: ' + notifyRes);
    setTimeout(() => {
      googlehome.notify('notify no.2, second', (notifyRes) => {
        console.log('notify no.2, second: ' + notifyRes);
      });
    }, 1000);
  });

  await sleep(5000).catch(onRejected);

  // success
  googlehome.device(deviceName)
    .language('ja')
    .notify('notify No.3', (notifyRes) => {
      console.log('notify No.3: ' + notifyRes);
    });
};

execReq();
