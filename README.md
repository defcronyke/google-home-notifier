# google-home-notifier
Send notifications to Google Home

#### Installation
```sh
$ git clone https://github.com/kazhik/google-home-notifier.git
$ cd google-home-notifier
$ npm install
```

#### Usage
```javascript
var googlehome = require('google-home-notifier');

// Required parameter
googlehome.device('Google Home'); // Change to your Google Home name
// or if you know your Google Home IP address
// googlehome.ip('192.168.1.20');

// Optional parameters
googlehome.language('pl'); // if not set 'en' language will be used
  .volume(1.0); // max: 1.0
  .timeout(2000); // TTS timeout: default value is 1000ms
  .speed(0.8); // TTS speed: default value is 1.0

googlehome.notify('Hey Foo', function(res) {
  console.log(res);
});
```

#### Listener
If you want to run a listener, take a look at the example.js file. You can run this from a Raspberry Pi, pc or mac. 
The example uses ngrok so the server can be reached from outside your network. 
I tested with ifttt.com Maker channel and it worked like a charm.

```sh
$ git clone https://github.com/kazhik/google-home-notifier
$ cd google-home-notifier
$ npm install
$ node example.js
Endpoints:
    http://192.168.1.20:8091/google-home-notifier
    https://xxxxx.ngrok.io/google-home-notifier
GET example:
curl -X GET https://xxxxx.ngrok.io/google-home-notifier?text=Hello+Google+Home  - to play given text
curl -X GET https://xxxxx.ngrok.io/google-home-play?url=http%3A%2F%2Fdomain%2Ffile.mp3 - to play from given url
POST example:
curl -X POST -d "text=Hello Google Home" https://xxxxx.ngrok.io/google-home-notifier - to play given text
curl -X POST -d "url=http://domain/file.mp3" https://xxxxx.ngrok.io/google-home-play - to play from given url

```
#### Raspberry Pi
If you are running from Raspberry Pi make sure you have the following before nunning "npm install":
Use the latest nodejs dist.
```sh
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install nodejs
```
Also install these packages:
```sh
sudo apt-get install git-core libnss-mdns libavahi-compat-libdnssd-dev
```

#### Test

test/testlib.js for testing google-home-notifier.js, test/testapp.js for testing example.js.

```sh
$ npm test
```
Coverage report is generated under `coverage` directory.
