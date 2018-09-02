var Client = require('castv2-client').Client;
var DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;
var googletts = require('google-tts-api');
var mdns = require('mdns');
var browser;
var deviceName;
var deviceAddress;
var language = 'us';
var speechRate = 1;
var ttsTimeout = 1000;
var speakerVolume;
const defaultValue = {
  language: 'en',
  deviceAddress: undefined,
  speechRate: 1.0,
  ttsTimeout: 1000,
  speakerVolume: 0.5,
};

var createMdnsBrowser = () => {
  var sequence = [
    mdns.rst.DNSServiceResolve(),
    'DNSServiceGetAddrInfo' in mdns.dns_sd ?
      mdns.rst.DNSServiceGetAddrInfo() :
        mdns.rst.getaddrinfo({families:[4]}),
        mdns.rst.makeAddressesUnique()
  ];
  return mdns.createBrowser(mdns.tcp('googlecast'),
    {resolverSequence: sequence});
};

var startMdnsBrowser = (callback) => {
  browser = createMdnsBrowser();
  browser.start();
  browser.on('error', (err) => {
    console.log('Browser Error: %s', err.message);
    browser.stop();
    callback();
  });
  browser.on('serviceUp', (service) => {
    console.log('Device "%s" at %s:%d', service.name, service.addresses[0], service.port);
    callback(service);
  });
};

var notify = (message, callback) => {
  if (!deviceName) {
    console.log('device name should be supplied before notify');
    callback();
    return;
  }
  if (!deviceAddress) {
    startMdnsBrowser((service) => {
      if (service.name.includes(deviceName.replace(' ', '-'))){
        deviceAddress = service.addresses[0];
        ttsAndPlay(message, deviceAddress, (res) => {
          callback(res);
        });
      } else {
        callback();
      }
      browser.stop();
    });
  } else {
    ttsAndPlay(message, deviceAddress, (res) => {
      callback(res);
    });
  }
};

var play = (mp3_url, callback) => {
  if (!deviceName) {
    console.log('device name should be supplied before play');
    callback();
    return;
  }
  if (!deviceAddress) {
    startMdnsBrowser((service) => {
      if (service.name.includes(deviceName.replace(' ', '-'))){
        deviceAddress = service.addresses[0];
        playMp3onDevice(deviceAddress, mp3_url, (res) => {
          callback(res);
        });
      } else {
        callback();
      }
      browser.stop();
    });
  } else {
    playMp3onDevice(deviceAddress, mp3_url, (res) => {
      callback(res)
    });
  }
};

var ttsAndPlay = (text, host, callback) => {
  googletts(text, language, speechRate, ttsTimeout).then((url) => {
    playMp3onDevice(host, url, (res) => {
      callback(res)
    });
  }).catch((err) => {
    console.log('googletts error: ' + err);
    ttsTimeout = defaultValue.ttsTimeout;
    speechRate = defaultValue.speechRate;
    language = defaultValue.language;
    callback();
  });
};

var playMp3onDevice = (host, url, callback) => {
  console.log('playing %s on %s', url, host);
  var client = new Client();
  client.connect(host, () => {
    if (speakerVolume) {
      client.setVolume({level: speakerVolume}, (err, vol) => {
        if (err) {
          console.log('Failed to set volume: %s', err.message);
          client.close();
          callback();
          return;
        }
        speakerVolume = undefined;
      });
    };
    client.launch(DefaultMediaReceiver, (err, player) => {
      if (err) {
        console.log('Failed to launch: %s', err.message);
        client.close();
        callback();
        return;
      }
      var media = {
        contentId: url,
        contentType: 'audio/mp3',
        streamType: 'BUFFERED' // or LIVE
      };
      player.load(media, { autoplay: true }, (err, status) => {
        if (err) {
          console.log('Failed to load: %s', err.message);
          language = defaultValue.language;
          client.close();
          callback();
          return;
        }
        client.close();
        callback('Device notified');
      });
    });
  });

  client.on('error', (err) => {
    console.log('Client Error: %s', err.message);
    deviceAddress = defaultValue.deviceAddress;
    client.close();
    callback();
  });
};

exports.ip = (ip) => {
  deviceAddress = ip;
  return this;
}
exports.device = (name) => {
  deviceName = name;
  return this;
};
exports.language = (lang) => {
  language = lang;
  return this;
};
exports.speed = (speed) => {
  speechRate = speed;
  return this;
};
exports.timeout = (timeout) => {
  ttsTimeout = timeout;
  return this;
};
exports.volume = (volume) => {
  if (volume < 0.0 || volume > 1.0) {
    console.log('Invalid volume value: %f', volume);
  } else {
    speakerVolume = volume;
  }
  return this;
};
exports.notify = notify;
exports.play = play;



