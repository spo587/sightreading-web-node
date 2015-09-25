var express = require('express');
var app = express();
//var BinaryServer = require('binaryjs').BinaryServer;
var fs = require('fs');
var server = require('http').createServer(app);
//var wav = require('wav');
var io = require('socket.io')(server);
var pd = require('./pitchDetect');
//var dl = require('delivery');


io.on('connection', function(socket){
    console.log('client connected');
    socket.on('blob', function(data){
        console.log('blob received');
        var blob = data.blob;
      //   forEachIn(blob, function(prop, val){
      //   if (val > 250){
      //       console.log(val);
      //   }
      // });
        var name = data.name;
        var url = name + String(new Date().getTime()) + '.wav';
        var txtfile = 'wav-file.txt';

        recordings.push(url);
        console.log(url);
        fs.writeFile(url, blob);
        fs.writeFile(txtfile, blob);
        getRecordingPages(recordings);
        appGet('/wav-file.txt', '/wav-file.txt');
        socket.broadcast.emit('new-recording', url);
    });
    socket.on('buffer', function(buffer){
        var obj = buffer[0];
        var len = Object.size(obj);
        var arr = new Float32Array(len);
        forEachIn(obj, function(prop, val){
            var i = Number(prop);
            arr[i] = val;
        });
        var subarrays = pd.makeSubArrays(arr, 100);
        subarrays.forEach(function(subarray){
            var freq = pd.autoCorrelate(subarray, 44100);
            var note = pd.noteFromPitch(freq);
            console.log(note);
        });
    });
});

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};


function forEachIn(object, func) {
    for (var property in object) {
        if (object.hasOwnProperty(property))
            func(property, object[property])
    }
}


function appGet(urlPath, fileExtension){
    app.get(urlPath, function(req, res){
        // res.header("Access-Control-Allow-Origin", "*");
        // res.header("Access-Control-Allow-Headers", "X-Requested-With");
        // res.header("Access-Control-Allow-Headers", "Content-Type");
        res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
        res.sendFile(__dirname + fileExtension);
    });
}

var recordings = [];

function getRecordingPages(recordings){
    recordings.forEach(function(recordingPage){
        appGet('/' + recordingPage, '/' + recordingPage);
    });
}

var midiIncShimScripts = ['Base64.js', 'Base64binary.js', 'WebAudioAPI.js'];

var midijsmidisscripts = ['audioDetect.js','gm.js','loader.js','plugin.audiotag.js',
    'plugin.webaudio.js', 'plugin.webmidi.js'];

midiIncShimScripts.forEach(function(script){
    appGet('/' + script, '/midijs/inc/shim/' + script);
});

midijsmidisscripts.forEach(function(script){
    appGet('/' + script, '/midijs/js/midi/' + script);
});

var scripts = ['utilities/head.min.js', 'utilities/jquery.js', 'scripts/vexflow-min.js',
            'scripts/vexflow-debug.js',
            'scripts/recorder.js',
            'scripts/recorderWorker.js',
            'scripts/VNSrhythms.js',
            'scripts/VNS.js',
            'scripts/arrayHelperFunctions.js',
            'scripts/newBeamFunctions.js',
            'scripts/level3_functions.js',
            'scripts/composition_functions_split.js',
            'scripts/composition_functions.js',
            'scripts/scales.js',
            'scripts/vexflow_objects.js',
            'scripts/music_on_canvas_functions.js',
            'scripts/interactive_elements.js',
            'node_modules/socket.io/node_modules/socket.io-client/socket.io.js',
            'scripts/midiFunctions.js'];

scripts.forEach(function(script){
    appGet('/' + script, '/' + script);
});

appGet('/dom_request_xhr.js','/midijs/js/util/dom_request_xhr.js');
appGet('/dom_request_script.js','/midijs/js/util/dom_request_script.js');

appGet('/soundfont/acoustic_grand_piano-ogg.js','/midijs/examples/soundfont/acoustic_grand_piano-ogg.js')

appGet('/miditest.html','/midijs/examples/Basic.html');

appGet('/', '/home.html');

var port = process.env.PORT || 9000;

//server.listen(8080);

server.listen(port, function() {
    console.log('Our app is running on http://localhost:' + port);
});