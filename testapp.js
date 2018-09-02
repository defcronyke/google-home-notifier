require('log-timestamp');
var request = require('request');

var notifyUrl = "http://192.168.1.8:8091/google-home-notifier";
var playUrl = "http://192.168.1.8:8091/google-home-play";

var songParams = [
    {
        volume: 1.0,
        url: "https://www.gnu.org/music/FreeSWSong.ogg",
    },
    {
        volume: 0.8,
        url: "https://www.gnu.org/music/FreeSWSong.ogg",
    },
];
var params = [
    {
        volume: 1.0,
        timeout: 1000,
        speed: 1,
        text: "Test Number 1",
        language: "ja",
    },
    {
        volume: 0.8,
        text: "Test Number 2",
        language: "en",
    },
    {
        volume: 1.0,
        text: "Test Number 3",
        language: "ja",
        ip: "192.168.1.4",
    },
    {
        text: "Test Number 4",
        language: "xx",
    },
    {
        text: "Test Number 5",
        language: "ja",
        ip: "192.168.1.41",
    },
    {
        volume: 1.1,
        text: "Test Number 6",
        language: "ja",
    },
    {
        text: "Test Number 7",
        language: "ja",
        timeout: 10,
    },
    {
        language: "ja",
    },
];

var execPostRequest = (url, data) => {
    var executor = (resolve, reject) => {
        request.post({url:url, form:data}, (err, res, body) => {
            if (err) {
                reject("Error: " + err);
            } else if (res.statusCode !== 200) {
                reject("Response Code: " + res.statusCode);
            } else {
                resolve(body);
            }
        });
    };
    return new Promise(executor);
};

var execGetRequest = (url, data) => {
    var executor = (resolve, reject) => {
        request.get({url:url, qs:data}, (err, res, body) => {
            if (err) {
                reject("Error: " + err);
            } else if (res.statusCode !== 200) {
                reject("Response Code: " + res.statusCode);
            } else {
                resolve(body);
            }
        });
    };
    return new Promise(executor);
};

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

    for (const param of params) {
        console.log('executing Get: ' + JSON.stringify(param));
        await execGetRequest(notifyUrl, param).catch(onRejected);
        await sleep(3000).catch(onRejected);
    }

    for (const param of params) {
        console.log('executing Post: ' + JSON.stringify(param));
        await execPostRequest(notifyUrl, param).catch(onRejected);
        await sleep(3000).catch(onRejected);
    }

    for (const param of songParams) {
        console.log('executing Get: ' + JSON.stringify(param));
        await execGetRequest(playUrl, param).catch(onRejected);
        await sleep(10000).catch(onRejected);

        console.log('executing Post: ' + JSON.stringify(param));
        await execPostRequest(playUrl, param).catch(onRejected);
        await sleep(10000).catch(onRejected);
    }
    
};

execReq();
