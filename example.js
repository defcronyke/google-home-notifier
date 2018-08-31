var express = require('express');
var googlehome = require('./google-home-notifier');
var ngrok = require('ngrok');
var exitHook = require('exit-hook');
var bodyParser = require('body-parser');
var app = express();
const serverPort = 8091; // default port

var deviceName = 'Google Home';

var urlencodedParser = bodyParser.urlencoded({ extended: false });

var sendText = (params, res) => {
  try {
    if (params.ip) {
      googlehome.ip(params.ip);
    }

    if (params.text.startsWith('http')){
      var mp3_url = params.text;
      googlehome.device(deviceName)
          .play(mp3_url, (notifyRes) => {
            if (!notifyRes) {
              res.send(deviceName + ' cannot play sound.\n');
              return;
            }
            console.log(notifyRes);
            res.send(deviceName + ' will play sound from url: ' + mp3_url + '\n');
          });
    } else {
      if (params.language) {
        googlehome.language(params.language);
      }
      if (params.speed) {
        googlehome.speed(Number(params.speed));
      }
      if (params.timeout) {
        googlehome.timeout(Number(params.timeout));
      }
      googlehome.device(deviceName)
          .notify(params.text, (notifyRes) => {
            if (!notifyRes) {
              res.send(deviceName + ' cannot say text.\n');
              return;
            }
            console.log(notifyRes);
            res.send(deviceName + ' will say: ' + params.text + '\n');
          });
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
    res.send(err);
  }
};

app.post('/google-home-notifier', urlencodedParser, (req, res) => {
  
  if (!req.body) return res.sendStatus(400)
  console.log(req.body);
  
  if (req.body.text) {
    sendText(req.body, res);
  } else {
    res.send('Please POST "text=Hello Google Home"');
  }
});

app.get('/google-home-notifier', (req, res) => {

  console.log(req.query);

  if (req.query.text) {
    sendText(req.query, res);
  } else {
    res.send('Please GET "text=Hello+Google+Home"');
  }
});

app.listen(serverPort, function () {
  ngrok.connect({configPath: '/home/pi/.ngrok2/ngrok.yml', addr: serverPort}, (err, url) => {
    if (err) {
      console.log('ngrok.connect failed');
      console.log(err);
      return;
    }
    console.log('Endpoints:');
    console.log('    http://localhost:' + serverPort + '/google-home-notifier');
    console.log('    ' + url + '/google-home-notifier');
    console.log('GET example:');
    console.log('curl -X GET ' + url + '/google-home-notifier?text=Hello+Google+Home');
    console.log('POST example:');
    console.log('curl -X POST -d "text=Hello Google Home" ' + url + '/google-home-notifier');
  });
});

exitHook(() => {
  ngrok.disconnect();
});
