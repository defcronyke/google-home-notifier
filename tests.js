require('log-timestamp');
var request = require('request');

var url = "http://192.168.1.8:8091/google-home-notifier";

var params = [
    {
        url: url,
        data: {
            volume: 1.0,
            timeout: 1000,
            speed: 1,
            text: "Test Number 1",
            language: "ja",
        }
    },
    {
        url: url,
        data: {
            volume: 0.8,
            text: "Test Number 2",
            language: "en",
        }
    },
    {
        url: url,
        data: {
            volume: 1.0,
            text: "Test Number 3",
            language: "ja",
            ip: "192.168.1.4",
        }
    },
    {
        url: url,
        data: {
            text: "Test Number 4",
            language: "xx",
        }
    },
    {
        url: url,
        data: {
            text: "Test Number 5",
            language: "ja",
            ip: "192.168.1.41",
        }
    },
    {
        url: url,
        data: {
            volume: 1.1,
            text: "Test Number 6",
            language: "ja",
        }
    },
    {
        url: url,
        data: {
            text: "Test Number 7",
            language: "ja",
            timeout: 10,
        }
    },
    {
        url: url,
        data: {
            language: "ja",
        }
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
        console.log('executing: ' + JSON.stringify(param.data));
        await execPostRequest(param.url, param.data).catch(onRejected);
        await sleep(3000).catch(onRejected);
    }
};

execReq();
