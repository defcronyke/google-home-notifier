require('log-timestamp');
var expect = require('expect.js');
var request = require('request');

var notifyUrl = "http://192.168.1.8:8091/google-home-notifier";
var playUrl = "http://192.168.1.8:8091/google-home-play";

var songParams = [
  {
    request: {
      volume: 1.0,
      url: "https://www.gnu.org/music/FreeSWSong.ogg",
    },
    response: {
      body: "Google Home will play sound",
      result: "success",
    },
  },
  {
    request: {
      volume: 0.8,
      url: "https://www.gnu.org/music/FreeSWSong.ogg",
    },
    response: {
      body: "Google Home will play sound",
      result: "success",
    },
  },
];
var params = [
  {
    request: {
      volume: 1.0,
      timeout: 1000,
      speed: 1,
      text: "maximum volume, english",
      language: "en",
    },
    response: {
      body: "Google Home will say",
      result: "success",
    }
  },
  {
    request: {
      volume: 0.8,
      text: "volume down, english",
      language: "en",
    },
    response: {
      body: "Google Home will say",
      result: "success",
    }
  },
  {
    request: {
      volume: 1.0,
      text: "Volume up, nihongo",
      language: "ja",
      ip: "192.168.1.4",
    },
    response: {
      body: "Google Home will say",
      result: "success",
    }
  },
  {
    request: {
      text: "Invalid language value",
      language: "xx",
    },
    response: {
      body: "Google Home cannot say",
      result: "fail",
    }
  },
  {
    request: {
      text: "Invalid IP address",
      language: "ja",
      ip: "192.168.1.41",
    },
    response: {
      body: "Google Home cannot say",
      result: "fail",
    }
  },
  {
    request: {
      ip: "192.168.1.4",
      volume: 1.1,
      text: "Invalid volume value",
      language: "en",
    },
    response: {
      body: "Google Home will say",
      result: "success",
    }
  },
  {
    request: {
      text: "tts timeout",
      language: "ja",
      timeout: 10,
    },
    response: {
      body: "Google Home cannot say",
      result: "fail",
    }
  },
  {
    request: {
      language: "ja",
    },
    response: {
      body: "Please",
      result: "fail",
    }
  },
];

var execPostRequest = (url, data, callback) => {
  request.post({url:url, form:data}, (err, res, body) => {
    if (err) {
      callback();
    } else if (res.statusCode !== 200) {
      callback();
    } else {
      callback(body);
    }
  });
};

var execGetRequest = (url, data, callback) => {
  request.get({url:url, qs:data}, (err, res, body) => {
    if (err) {
      callback();
    } else if (res.statusCode !== 200) {
      callback();
    } else {
      callback(body);
    }
  });
};

describe('google-home-notifier app test', function() {
  this.timeout(10000);

  for (const param of params) {
    it('executing Get: ' + JSON.stringify(param.request), function(done) {
      execGetRequest(notifyUrl, param.request, (res) => {
        expect(res).to.contain(param.response.body);
        if (param.response.result === "success") {
          setTimeout(done, 3000);
        } else {
          done();
        }
      });
    });

    it('executing Post: ' + JSON.stringify(param.request), function(done) {
      execPostRequest(notifyUrl, param.request, (res) => {
        expect(res).to.contain(param.response.body);
        if (param.response.result === "success") {
          setTimeout(done, 3000);
        } else {
          done();
        }
      });
    });
  }

  for (const param of songParams) {
    it('executing Get: ' + JSON.stringify(param.request), function(done) {
      execGetRequest(playUrl, param.request, (res) => {
        expect(res).to.contain(param.response.body);
        if (param.response.result === "success") {
          setTimeout(done, 5000);
        } else {
          done();
        }
      });
    });

    it('executing Post: ' + JSON.stringify(param.request), function(done) {
      execPostRequest(playUrl, param.request, (res) => {
        expect(res).to.contain(param.response.body);
        if (param.response.result === "success") {
          setTimeout(done, 5000);
        } else {
          done();
        }
      });
    });
  }
    
});

