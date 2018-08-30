var Client = require('castv2-client').Client;
var DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;
var googletts = require('google-tts-api');
var mdns = require('mdns');
var sequence = [
  mdns.rst.DNSServiceResolve(),
  'DNSServiceGetAddrInfo' in mdns.dns_sd ?
    mdns.rst.DNSServiceGetAddrInfo() :
      mdns.rst.getaddrinfo({families:[4]}),
      mdns.rst.makeAddressesUnique()
];
var browser = mdns.createBrowser(mdns.tcp('googlecast'),
    {resolverSequence: sequence});
var deviceAddress;
var language = 'us';
var speechRate = 1;

var device = function(name) {
  device = name;
  return this;
};

var ip = function(ip) {
  deviceAddress = ip;
  return this;
}

var ttsLanguage = function(lang) {
  language = lang;
  return this;
};

var ttsSpeed = function(speed) {
  speechRate = speed;
  return this;
};

var notify = function(message, callback) {
  if (!deviceAddress){
    browser.start();
    browser.on('error', function(err) {
        console.log(err);
        browser.stop();
        callback();
    });
    browser.on('serviceUp', function(service) {
      console.log('Device "%s" at %s:%d', service.name, service.addresses[0], service.port);
      if (service.name.includes(device.replace(' ', '-'))){
        deviceAddress = service.addresses[0];
        getSpeechUrl(message, deviceAddress, function(res) {
          callback(res);
        });
      }
      browser.stop();
    });
  }else {
    getSpeechUrl(message, deviceAddress, function(res) {
      callback(res);
    });
  }
};

var play = function(mp3_url, callback) {
  if (!deviceAddress){
    browser.start();
    browser.on('error', function(err) {
        console.log(err);
        browser.stop();
        callback();
    });
    browser.on('serviceUp', function(service) {
      console.log('Device "%s" at %s:%d', service.name, service.addresses[0], service.port);
      if (service.name.includes(device.replace(' ', '-'))){
        deviceAddress = service.addresses[0];
        getPlayUrl(mp3_url, deviceAddress, function(res) {
          callback(res);
        });
      }
      browser.stop();
    });
  }else {
    getPlayUrl(mp3_url, deviceAddress, function(res) {
      callback(res);
    });
  }
};

var getSpeechUrl = function(text, host, callback) {
  googletts(text, language, speechRate, 1000).then(function (url) {
    onDeviceUp(host, url, function(res){
      callback(res)
    });
  }).catch(function (err) {
    console.error(err.stack);
  });
};

var getPlayUrl = function(url, host, callback) {
    onDeviceUp(host, url, function(res){
      callback(res)
    });
};

var onDeviceUp = function(host, url, callback) {
  var client = new Client();
  client.connect(host, function() {
    client.launch(DefaultMediaReceiver, function(err, player) {

      var media = {
        contentId: url,
        contentType: 'audio/mp3',
        streamType: 'BUFFERED' // or LIVE
      };
      player.load(media, { autoplay: true }, function(err, status) {
        client.close();
        callback('Device notified');
      });
    });
  });

  client.on('error', function(err) {
    console.log('Error: %s', err.message);
    client.close();
    callback('error');
  });
};

exports.ip = ip;
exports.device = device;
exports.language = ttsLanguage;
exports.speed = ttsSpeed;
exports.notify = notify;
exports.play = play;
