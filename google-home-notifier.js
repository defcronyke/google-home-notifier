var Client = require('castv2-client').Client;
var DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;
var googletts = require('google-tts-api');
var mdns = require('mdns');
var browser;
var deviceName;
const defaultParams = {
  language: 'en',
  deviceAddress: undefined,
  speechRate: 1.0,
  ttsTimeout: 1000,
  speakerVolume: undefined,
};
var params = JSON.parse(JSON.stringify(defaultParams));

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

var startMdnsBrowser = (successCallback, errorCallback) => {
  browser = createMdnsBrowser();
  browser.start();
  browser.on('error', (err) => {
    console.log('Browser Error: %s', err.message);
    browser.stop();
    errorCallback();
  });
  browser.on('serviceUp', (service) => {
    console.log('Device "%s" at %s:%d', service.name, service.addresses[0], service.port);
    if (service.name.includes(deviceName.replace(' ', '-'))){
      params.deviceAddress = service.addresses[0];
      successCallback(params.deviceAddress);
    } else {
      errorCallback();
    }
    browser.stop();
  });
};

var notify = (message, callback) => {
  if (!params.deviceAddress) {
    if (!deviceName) {
      console.log('Device address or device name should be supplied before notify');
      callback();
      return;
    }
    startMdnsBrowser((deviceAddress) => {
      ttsAndPlay(message, deviceAddress, (res) => {
        callback(res);
      });
    }, callback);
  } else {
    ttsAndPlay(message, params.deviceAddress, (res) => {
      callback(res);
    });
  }
};

var play = (mp3_url, callback) => {
  if (!params.deviceAddress) {
    if (!deviceName) {
      console.log('Device address or device name should be supplied before play');
      callback();
      return;
    }
    startMdnsBrowser((deviceAddress) => {
      playMp3onDevice(deviceAddress, mp3_url, (res) => {
        callback(res);
      });
    }, callback);
  } else {
    playMp3onDevice(params.deviceAddress, mp3_url, (res) => {
      callback(res)
    });
  }
};

var ttsAndPlay = (text, host, callback) => {
  googletts(text, params.language, params.speechRate, params.ttsTimeout).then((url) => {
    playMp3onDevice(host, url, (res) => {
      callback(res)
    });
  }).catch((err) => {
    console.log('googletts error: ' + err);
    params.ttsTimeout = defaultParams.ttsTimeout;
    params.speechRate = defaultParams.speechRate;
    params.language = defaultParams.language;
    callback();
  });
};

var playMp3onDevice = (host, url, callback) => {
  console.log('playing %s on %s', url, host);
  var client = new Client();
  client.connect(host, () => {
    if (params.speakerVolume) {
      client.setVolume({level: params.speakerVolume}, (err, vol) => {
        if (err) {
          console.log('Failed to set volume: %s', err.message);
          client.close();
          callback();
          return;
        }
        params.speakerVolume = defaultParams.speakerVolume;
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
          params.language = defaultParams.language;
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
    params.deviceAddress = defaultParams.deviceAddress;
    client.close();
    callback();
  });
};

exports.ip = (ip) => {
  params.deviceAddress = ip;
  return this;
}
exports.device = (name) => {
  deviceName = name;
  return this;
};
exports.language = (lang) => {
  params.language = lang;
  return this;
};
exports.speed = (speed) => {
  if (typeof(speed) !== 'number') {
    console.log('Invalid speed value: %s', speed);
    return this;
  }
  params.speechRate = speed;
  return this;
};
exports.timeout = (timeout) => {
  if (typeof(timeout) !== 'number') {
    console.log('Invalid timeout value: %s', timeout);
    return this;
  }
  params.ttsTimeout = timeout;
  return this;
};
exports.volume = (volume) => {
  if (typeof(volume) !== 'number') {
    console.log('Invalid volume value: %s', volume);
    return this;
  }
  if (volume < 0.0 || volume > 1.0) {
    console.log('Invalid volume value: %f', volume);
    return this;
  }
  params.speakerVolume = volume;
  return this;
};
exports.notify = notify;
exports.play = play;



