var express = require('express');
var app = express();
var BinaryServer = require('binaryjs').BinaryServer;
var fs = require('fs');
var server = require('http').createServer(app);
var wav = require('wav');
var io = require('socket.io')(server);
//var dl = require('delivery');



io.on('connection', function(socket){
    console.log('client connected');
    socket.on('blob', function(blob){
        var url = getNewUrl(recordings);
        fs.writeFile(url, blob);
        getRecordingPages(recordings);
        //socket.broadcast.emit('new-recording', url);
    });
});

function getNewUrl(recordings, socket){
    var len = recordings.length;
    var str = 'test' + String(len + 1);
    var url = str + '.wav';
    recordings.push(url);
    return url;
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

var scripts = ['utilities/head.min.js', 'utilities/jquery.js', 'scripts/vexflow-min.js',
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
            'node_modules/socket.io/node_modules/socket.io-client/socket.io.js'];

scripts.forEach(function(script){
    appGet('/' + script, '/' + script);
});



appGet('/', '/home.html');

var port = process.env.PORT || 9000;

//server.listen(8080);

server.listen(port, function() {
    console.log('Our app is running on http://localhost:' + port);
});