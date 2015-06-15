

var TIME;  
window.onload = function () {
    TIME = new Date().getTime();
    MIDI.loadPlugin({
        soundfontUrl: "./soundfont/",
        instrument: "acoustic_grand_piano",
        onprogress: function(state, progress) {
            console.log(state, progress);
        },
        onsuccess: function() {
            //playNote(60,0);
            //playNote(62, 1);
            //playMelody(notes, 0.25);
            //playMelodyRhythm(notes, durations);
            // var delay = 0; // play one note every quarter second
            // var note = 50; // the MIDI note
            // var velocity = 127; // how hard the note hits
            // // play the note
            // MIDI.setVolume(0, 127);
            // MIDI.noteOn(0, note, velocity, delay);
            // MIDI.noteOff(0, note, delay + 0.75);
        }
    });
};

function play(){
    var startDelay = (new Date().getTime() - TIME) / 1000 + 1;
    //console.log(startDelay);
    //playMelodyRhythm(notes, durations, startDelay);
    playMelody(phrase, 0, 3, startDelay);
}

//var startDelay = 5.698;

function playNote(noteNumber, delayOn, duration){
    var velocity = 60;
    MIDI.setVolume(0, 127);
    MIDI.noteOn(0, noteNumber, velocity, delayOn);
    MIDI.noteOff(0, noteNumber, delayOn + duration);
}

var notes = [50, 52, 54, 55, 57, 58];

// function playMelody(notesArray, tempo){
//  //all quarter notes
//  //console.log('playing melody');
//  MIDI.setVolume(0, 127);
//  var velocity = 60;
//  var initialDelay = 4;
//  var delay = initialDelay;
//  notesArray.forEach(function(note){
//      //console.log('playing next note');
//      playNote(note, delay, tempo);
//      delay += tempo;
//  });
// }

function playMelodyRhythm(notes, durations, startDelay, tempo){
    var rhythmDelays = mapReduce(durations);
    notes.forEach(function(current, ind, arr){
        playNote(current, rhythmDelays[ind] * 60 / tempo + startDelay, durations[ind] * 60 / tempo);
    });
}

var durations = [1, 2, 1, 0.5, 0.5, 1]
//var rhythmDelays = mapReduce(durations);

// function combineRhythmScaledegreeArrays(steps, rhythms){
//     //both are 2d nested arrays
//     //return pairs
//     var stepsUn = unNestArray(steps);
//     var rhythmsUn = unNestArray(rhythms);
//     return stepsUn.map(function(current, index, array){
//         return [current].concat(rhythmsUn[index]);
//     });
// }

function mapReduce(arr){
    return arr.map(function(c, i, a){
        return a.slice(0,i).reduce(function(prev, curr, ind, arr){
            return prev + curr
        }, 0);
    });
}

function playMelody(vexflowPhrase, key, major_or_minor, octave, startDelay, tempo){
    var rhythms = unNestArray(vexflowPhrase.rhythms);
    var steps = unNestArray(vexflowPhrase.steps);
    var notes = steps.map(function(current){
        return convertToNote(current, key, major_or_minor, octave);
    });
    //console.log(notes);
    var vexToDurationDict = {'w':4, 'hd':3, 'h': 2, 'q':1, 'qd':1.5, '8':0.5};
    var durations = rhythms.map(function(current){
        return vexToDurationDict[current];
    });
        
    //var combined = combineRhythmScaledegreeArrays(steps, rhythms);
    playMelodyRhythm(notes, durations, startDelay, tempo); 
}

$('#playMidi').click(function(){
    var tempo = Number($('#slider-speed-1').val()); //need error exception
    var vexflowExample = STOREEXAMPLE[STOREEXAMPLE.length - 1];
    var phrase1 = vexflowExample.phrases[0];
    var phrase2 = vexflowExample.phrases[1];
    var major_or_minor = vexflowExample.major_or_minor;
    var key = vexflowExample.key;
    var octaveObject = vexflowExample.octaves;
    
    var secondPhraseDelay = 1 + vexflowExample.beatsPerMeasure * vexflowExample.numBarsPerHand * 60 / tempo;
    console.log(secondPhraseDelay);
    var octaves = octaveObject.firstHand === 'r' ? [octaveObject.r + 1, octaveObject.l + 1] :
        [octaveObject.l + 1, octaveObject.r + 1];
    playMelody(phrase1, key, major_or_minor, octaves[0], 1, tempo);
    playMelody(phrase2, key, major_or_minor, octaves[1], secondPhraseDelay, tempo); 
});

function convertToNote(scaleDegree, key, major_or_minor, octave){
    //scaleDegree = Number(scaleDegree);
    var scale = major_or_minor === 'm' ? new SharpMinorScale(key) : new SharpMajorScale(key);
    return octave * 12 + Number(key) + 5 + Number(scale.scaleStepsToHalfSteps[scaleDegree]);
    
}

var phrase = {steps: [['0','1'],['2','3']], rhythms: [['hd','q'],['h','h']]}