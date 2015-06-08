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
    var delivery = dl.listen(socket);
    delivery.on('receive.start',function(filePackage){
  //console.log(filePackage.name);
  console.log(filePackage.size);
  console.log(filePackage.data);
  // console.log(filePackage.mimeType());
  //console.log(filePackage.isText());
});
    delivery.on('receive.success',function(file){
 
    console.log(file);
});
    socket.on('blob', function(blob){
        // console.log('blob received');
        // console.log(blob.length);
        // console.log(typeof(blob));
        var url = 'test.wav';
        fs.writeFile(url, blob);
        socket.broadcast.emit('new-recording', url);
        // forEachIn(blob, function(prop, val){
        //     console.log(prop);
        //     console.log(val);
        // });
        // var stream = WaveStream('/test.wav', 44100);
        // stream.write(blob);
        // stream.end();
    });
});

function forEachIn(object, func) {
    for (var property in object) {
        if (object.hasOwnProperty(property))
            func(property, object[property])
    }
}
    // socket.on('sightreading-example', function(data){
    //     //console.log('data received?');
    // });
    // socket.on('new-recording', function(data){
    //     socket.broadcast.emit('posting-new-recording', data);
    // });

// });

// ss(io).on('file', function(stream){
//     console.log('receiving file');
//     fs.createReadStream('/test.wav').pip(stream)
// });


// var binaryserver = new BinaryServer({server: server, path: '/binary-endpoint'});

// COUNT = 0;
// binaryserver.on('connection', function(client){
//     var fileWriter = null;

//     client.on('stream', function(stream, meta) {
//         console.log(COUNT);
//           COUNT += 1
//           var fileWriter = new wav.FileWriter('demo1.wav', {
//             channels: 1,
//             sampleRate: 41400,
//             bitDepth: 16
//           });
//           stream.pipe(fileWriter);
//           stream.on('end', function() {
//             fileWriter.end();
//           });
//         for(var id in binaryserver.clients){
//       if(binaryserver.clients.hasOwnProperty(id)){
//         var otherClient = binaryserver.clients[id];
//         if(otherClient != client){
//           var send = otherClient.createStream(meta);
//           stream.pipe(send);
//         }
//       }
//     }
//         });

//         client.on('close', function() {
//           if (fileWriter != null) {
//             fileWriter.end();
//           }
//         }); 

// });



function appGet(urlPath, fileExtension){
    app.get(urlPath, function(req, res){
        // res.header("Access-Control-Allow-Origin", "*");
        // res.header("Access-Control-Allow-Headers", "X-Requested-With");
        // res.header("Access-Control-Allow-Headers", "Content-Type");
        res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
        res.sendFile(__dirname + fileExtension);
    });
}

scripts = ['utilities/head.min.js', 'utilities/jquery.js', 'scripts/vexflow-min.js',
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
            'node_modules/socket.io-stream/socket.io-stream.js',
            'node_modules/delivery/lib/client/delivery.js',
            'upload.php',
            'demo1.wav',
            'test.wav'];

scripts.forEach(function(script){
    appGet('/' + script, '/' + script);
});

appGet('/', '/home.html');

var port = process.env.PORT || 9000;

//server.listen(8080);

server.listen(port, function() {
    console.log('Our app is running on http://localhost:' + port);
});