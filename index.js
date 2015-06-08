var express = require('express');
var app = express();
var BinaryServer = require('binaryjs').BinaryServer;
var fs = require('fs');
var server = require('http').createServer(app);
var wav = require('wav');
var io = require('socket.io')(server);
//var dl = require('delivery');

var MIN_SAMPLES = 0;  // will be initialized when AudioContext is created.

function autoCorrelate( buf, sampleRate ) {
    var SIZE = buf.length;
    var MAX_SAMPLES = Math.floor(SIZE/2);
    var best_offset = -1;
    var best_correlation = 0;
    var rms = 0;
    var foundGoodCorrelation = false;
    var correlations = new Array(MAX_SAMPLES);

    for (var i=0;i<SIZE;i++) {
        var val = buf[i];
        rms += val*val;
    }
    rms = Math.sqrt(rms/SIZE);
    if (rms<0.01) // not enough signal
        return -1;

    var lastCorrelation=1;
    for (var offset = MIN_SAMPLES; offset < MAX_SAMPLES; offset++) {
        var correlation = 0;

        for (var i=0; i<MAX_SAMPLES; i++) {
            correlation += Math.abs((buf[i])-(buf[i+offset]));
        }
        correlation = 1 - (correlation/MAX_SAMPLES);
        correlations[offset] = correlation; // store it, for the tweaking we need to do below.
        if ((correlation>0.9) && (correlation > lastCorrelation)) {
            foundGoodCorrelation = true;
            if (correlation > best_correlation) {
                best_correlation = correlation;
                best_offset = offset;
            }
        } else if (foundGoodCorrelation) {
            // short-circuit - we found a good correlation, then a bad one, so we'd just be seeing copies from here.
            // Now we need to tweak the offset - by interpolating between the values to the left and right of the
            // best offset, and shifting it a bit.  This is complex, and HACKY in this code (happy to take PRs!) -
            // we need to do a curve fit on correlations[] around best_offset in order to better determine precise
            // (anti-aliased) offset.

            // we know best_offset >=1, 
            // since foundGoodCorrelation cannot go to true until the second pass (offset=1), and 
            // we can't drop into this clause until the following pass (else if).
            var shift = (correlations[best_offset+1] - correlations[best_offset-1])/correlations[best_offset];  
            return sampleRate/(best_offset+(8*shift));
        }
        lastCorrelation = correlation;
    }
    if (best_correlation > 0.01) {
        // console.log("f = " + sampleRate/best_offset + "Hz (rms: " + rms + " confidence: " + best_correlation + ")")
        return sampleRate/best_offset;
    }
    return -1;
//  var best_frequency = sampleRate/best_offset;
}

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
        //socket.broadcast.emit('new-recording', url);
    });
    socket.on('buffer', function(buffer){
        var obj = buffer[0];
        var len = Object.size(obj);
        var arr = new Float32Array(len);
        forEachIn(obj, function(prop, val){
            var i = Number(prop);
            arr[i] = val;
        });
        var subarrays = makeSubArrays(arr, 100);
        subarrays.forEach(function(subarray){
            var cor = autoCorrelate(subarray, 44100);
            console.log(cor);
        });
        // var cor = autoCorrelate(arr, 44100);
        // console.log(cor);
    });
});

function makeSubArrays(arr, numSlices){
    var newArr = [];
    var cutIndices = [];
    var ind = arr.length / numSlices;
    for (var i=0; i<numSlices; i++){
        cutIndices.push(ind * i);
        //console.log(cutIndices);
    }
    for (var i=0; i<numSlices; i++){
        var start = cutIndices[i];
        newArr.push(arr.subarray(start, cutIndices[i + 1]));
    }
    return newArr;
}

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

// function getNewUrl(recordings, socket){
//     var len = recordings.length;
//     var str = 'test' + String(len + 1);
//     var url = str + '.wav';
//     recordings.push(url);
//     return url;
// }

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