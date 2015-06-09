// //the next three functions are some very basic composing algorithms based on scale degrees. 
// // nothing exciting here


//let's take a top-down approach


function makeLineRhythmsFirst(beatsPerMeasure, numMeasures, level, highestScaleDegree, open_or_closed){
    //this function will make rhythms and melody notes separately, as my current system does.
    //we'll make separate high level functions for the other way around and different combos
    //console.log(open_or_closed);
    var rhythms = generateRhythms(beatsPerMeasure, numMeasures, level)
    var length = findLength(rhythms)
    if (level === 3){
        var randomMelody = makeRandomMelody(undefined, length, highestScaleDegree, open_or_closed);
        var melodyNotesInts = VNS(randomMelody, 3, 2).scaleDegrees;
        //console.log(melodyNotesInts);
        var melodyNotes = melodyNotesInts.map(function(current){
            return String(current);
        });
    }

    else {
        var melodyNotes = generateMelody(length, level, highestScaleDegree, open_or_closed);
    }
    ////console.log(melodyNotes);
    var melodyNotesNested = nestArray(rhythms, melodyNotes);
    var rhythmsMelodyTogether = combineArray(rhythms, melodyNotes)
    return {rhythms: rhythms, melody: melodyNotesNested, together: rhythmsMelodyTogether};
}


function generateRhythms(beatsPerMeasure, numMeasures, level){
    var rhythms = [];
    for (var i=0; i<numMeasures - 1; i += 1) {
        rhythms.push([]);
        var beat = 0;
        while (beat < beatsPerMeasure) {
            var next = generateNextRhythm(beatsPerMeasure, beat, level);
            rhythms[i].push(durationToVex(next, beatsPerMeasure));
            beat += next;
        }
    }
    //what to put in last bar?? right now: whole bar
    rhythms.push([durationToVex(beatsPerMeasure, beatsPerMeasure)]);
    //rhythms.push([durationToVex(fillLastMeasure(beatsPerMeasure, level), beatsPerMeasure)])
    return rhythms;
}

function generateNextRhythm(beatsPerMeasure, currentBeat, level){
    var shortestDurationDict = {1:1, 2:1, 3:0.5};
    var longestDuration = nextHierarchicBeat2(beatsPerMeasure, currentBeat);
    var possibles = range(longestDuration, shortestDurationDict[level]);
    ////console.log(possibles);
    //change weights?
    randNumWeighted = Math.pow(Math.random(), 1.3);
    var duration = possibles[Math.floor(randNumWeighted * possibles.length)];
    /// not ready for ties quite yet, change this to deal with ties later
    if (duration != 2.5 && duration != 3.5 && duration != 4 && duration != 0) {
        ////console.log(duration);
        return duration;
    }
    else {
        return generateNextRhythm(beatsPerMeasure, currentBeat, level);
    }
}

function nextHierarchicBeat2(beatsPer, currentBeat){
    //find the time until the next beat one level up in the rhythmic hierarchy
    //beats are indexed to 0, so a 4/4 measure has beats at 0, 1, 2, 3
    //for instance on beat 2, the next level a beat 'up' is the next downbeat, 2 beats away
    //on an eighth note beat, like 0.5 or 1.5 , the next beat is a half note, or 0.5 beats, away.
    var divider = beatsPer % 3 === 0 ? 3 : 2;
    if (currentBeat === 0){
        return beatsPer;
    }
    else {
        return nextHierarchicBeat2(beatsPer/divider, currentBeat % (beatsPer / divider));
    }
}

// function nextHierarchicBeat3(beatsPer, currentLocation){
//     //currentLocation is a universal spot, not just a beat in the measure but a beat in group of measures

//     var divider = beatsPer % 3 === 0 ? 3 : 2;
//     if (currentLocation % beatsPer === 0){
//         return beatsPer;
//     }
//     else {
//         return nextHierarchicBeat3(beatsPer/divider, currentLocation % (beatsPer / divider));
//     }
// }



function generateMelody(length, level, highestScaleDegree, open_or_closed){
    var notes = makeMelodyAnyLevel(length - 1, level, highestScaleDegree).scaleDegrees;
    //check to make sure the span of the melody is at least a fourth
    // can i do this in the makemelody function instead? change this later
    var max = arrayMax(notes);
    var min = arrayMin(notes);
    while (max - min < 3){
        ////console.log('looping through makemelody again');
        notes = makeMelodyAnyLevel(length - 1, level, highestScaleDegree).scaleDegrees;
        max = arrayMax(notes);
        min = arrayMin(notes);
    }
    notes.forEach(function(element, index, array){
        array[index] = String(array[index]);
    })

    if (open_or_closed ===  'closed'){
        //console.log('reversing');
        notes.reverse();
    }
    return notes;
}

function makeMelodyAnyLevel(lengthLessOne, level, highestScaleDegree, melody){
    //level three only supports normal five finger position yet
    if (melody === undefined){
        var firstTonic = highestScaleDegree <= 4 ? 0 : 2;
        ////console.log(firstTonic);
        var melody = {scaleDegrees: [firstTonic], intervals: [], intervalCounts: {step:0, skip:0, leap:0, repeat:0}, fifthDegreePosition: randomIntFromInterval(1,length)}
    }
    if (lengthLessOne === 0){
        return melody;
    }
    melody = addToMelodyAnyLevel(level, highestScaleDegree, melody);
    return makeMelodyAnyLevel(lengthLessOne - 1, level, highestScaleDegree, melody);
}


function addToMelodyAnyLevel(level, highestScaleDegree, melody){
    if (level === 3){
        return addToMelody(melody, highestScaleDegree)
    }
    else {
        return chooseNextScaleDegree(melody, level, highestScaleDegree)
    }
}

function chooseNextScaleDegree(melody, level, highestScaleDegree){
    //level 1 or 2 only
    //highest scale degree as an int, 4 for 5th scale degree
    var fiveFingerNotes = rangeBetter(highestScaleDegree - 4, 5, 1);
    ////console.log(fiveFingerNotes)
    var lastScaleDegree = melody.scaleDegrees[melody.scaleDegrees.length - 1];
    var up = lastScaleDegree < highestScaleDegree ? stepsAway(level) : 0;
    var down = lastScaleDegree > highestScaleDegree - 4 ? - stepsAway(level) : 0;
    var stay = 0;
    ///check for repeated notes?? 
    var choices = arrayUnique([stay, up, down]);
    var randNumWeighted = Math.pow(Math.random(), 0.4);
    var change = choices[Math.floor(randNumWeighted * choices.length)];
    ////console.log(change);
    var nextScaleDegree = lastScaleDegree + change;
    if (fiveFingerNotes.indexOf(nextScaleDegree) > -1){
        melody.scaleDegrees.push(nextScaleDegree);
        //don't care for now about intervals and other stuff for level 1 and 2
        return melody;
    }
    else {
        return chooseNextScaleDegree(melody, level, highestScaleDegree);
    }
}




function makeLineNotesFirst(beatsPerMeasure, beatValue, numMeasures, level, highestScaleDegree, open_or_closed){

}

function makeLineNotesRhythmsTogether(beatsPerMeasure, beatValue, numMeasures, level, highestScaleDegree, open_or_closed){

}


function stepsAway(level){
    if (level == 1){
        return 1;
    }
    else if (level == 2){
        var possibles = range(2,1);
        return possibles[Math.floor(Math.random() * possibles.length)];
    }
}


function durationToVex(duration, beatsPer) {
    //convert rhythmic duration returned by generate rhythm function to vexflow-readable format
    var durationToVexDict = {4:'w', 3:'hd', 2:'h', 1:'q', 1.5:'qd', 0.5:'8'};
    if (beatsPer <= 4) {
        return durationToVexDict[duration];
    }
}

function vexToDuration(vexNote, beatsPer) {
    //reverse of the above
    var vexToDurationDict = {'w':4, 'hd':3, 'h': 2, 'q':1, 'qd':1.5, '8':0.5};
    var dot = 0;
    if (vexNote.dots !== 0) {
        dot = 0.5;
    }
    if (beatsPer <= 4) {
        var base = vexToDurationDict[vexNote.duration] 
        return base + dot*base;
    }
}






//new idea: add notes in at different parts of the measure. maybe even bypass rhythms using the hierarchic
// function. proceed by eighth note, can be no longer than nexthierarchicbeat2. eighth notes always move by step.


// function makeMelodyAndRhythmLevel3(currentBeat, beatsRemaining, beatsPer, melody){
//     if (melody === undefined){
//         var melody = {beatsPer: beatsPer, scaleDegrees:[0], rhythms:[], intervals: [], intervalCounts: {step:0, skip:0, leap:0, repeat:0}};
//     }
//     if (beatsRemaining === 0){
//         return melody
//     }
//     melody = addToMelody3(melody, currentBeat, beatsPer);
//     var lastNoteLength = melody.rhythms[melody.rhythms.length - 1];
//     var beatUpdate = (currentBeat + lastNoteLength)%beatsPer;

//     return makeMelodyAndRhythmLevel3(beatUpdate, beatsRemaining - lastNoteLength, beatsPer, melody);

// }

// function addToMelody3(melody){
//     var nextRhythm = decideRhythm(melody);
//     var nextScaleDegree = decideScaleDegree(melody);
//     melody = addScaleDegreeAndRhythm(nextScaleDegree, nextRhythm);
//     return melody
// }

// function addScaleDegreeAndRhythm(nextScaleDegree, nextRhythm, melody){
//     var currentNote = melody.scaleDegrees[melody.scaleDegrees.length - 1];
//     var nextInterval = nextScaleDegree - currentNote;
//     melody.intervals.push(nextInterval);
//     melody.intervalCounts[skipStepLeap(nextInterval)] += 1;
//     melody.scaleDegrees.push(nextScaleDegree);
//     melody.rhythms.push(nextRhythm);
//     return melody;
// }

// function decideRhythm(melody){
//     var totalBeats = melody.rhythms.reduce(function(a,b){return a + b});
//     var maxLength = nextHierarchicBeat2(totalBeats%melody.beatsPer);
//     var minLength = 0.5;
//     var possibles = rangeBetter(minLength, maxLength, 0.5);
//     var weighted = Math.pow(Math.random(),0.6);
//     var selection = possibles[Math.floor(weighted * possibles.length)];
//     return selection;
// }

// function decideScaleDegree(melody){
//     //rhythm already decided
//     var rhythm = melody.rhythms[melody.rhythms.length - 1];

//}