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
    console.log('notify no.1: %s', (!notifyRes)? 'SUCCESS':'FAIL');
  });

  await sleep(3000).catch(onRejected);

  // No error if invalid device name is supplied
  googlehome.device('InvalidName', 'en')
  googlehome.notify('notify no.2', (notifyRes) => {
    console.log('notify no.2: %s',  (!notifyRes)? 'SUCCESS':'FAIL');
    setTimeout(() => {
      googlehome.notify('notify no.2, second', (notifyRes) => {
        console.log('notify no.2, second: %s',
          (!notifyRes)? 'SUCCESS':'FAIL');
      });
    }, 1000);
  });

  await sleep(5000).catch(onRejected);

  // success
  googlehome.device(deviceName)
    .language('ja')
    .notify('notify No.3', (notifyRes) => {
      console.log('notify no.3: %s', (notifyRes)? 'SUCCESS':'FAIL');
    });

  await sleep(5000).catch(onRejected);

  // invalid timeout value should be ignored
  googlehome.timeout('aaa')
    .notify('notify No.4', (notifyRes) => {
      console.log('notify no.4: %s', (notifyRes)? 'SUCCESS':'FAIL');
    });

  await sleep(3000).catch(onRejected);

  // invalid speed value should be ignored
  googlehome.speed('bbb')
    .notify('notify No.5', (notifyRes) => {
      console.log('notify no.5: %s', (notifyRes)? 'SUCCESS':'FAIL');
    });
    
  await sleep(3000).catch(onRejected);

  // invalid timeout value should be ignored
  googlehome.timeout('ccc')
    .notify('notify No.6', (notifyRes) => {
      console.log('notify no.6: %s', (notifyRes)? 'SUCCESS':'FAIL');
    });
};

execReq();
