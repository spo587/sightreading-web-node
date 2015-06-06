// rhythmic rules for 'first species'

//no syncopations (hierarchically speaking)
//will need to generate a random, non-syncopated

// mixture of motion and repose

// rhythms should relate to each other (motivic??) over the first 3 bars

// large leaps in melody should coincide with rhythmic repose

//good rhythm: distinctive (variation from even and smooth), relationship between measures (pattern-match?)
// increasing motion as go along

function makeRandomRhythm(lengthLessOne, numBarsLessOne, beatsPer, shortestDuration){
    //shortestDuration === 1/2 for 8th note, 1 for quarter notes, etc. ?

    //first, number of rhythmic 'slots' that we can put notes into
    var numSlots = beatsPer * numBarsLessOne / shortestDuration;
    //console.log(numSlots);
    var slots = rangeBetter(0, beatsPer * numBarsLessOne, shortestDuration);
    //console.log(slots);
    var rhythms = [];
    //start on the beat. FIX THIS when we have rests
    rhythms.push(0);
    slots.splice(0, 1);
    for (var i = 1; i < lengthLessOne - 1; i += 1){
        var toAdd = randomChoiceFromArray(slots);
        slots.splice(slots.indexOf(toAdd), 1);
        rhythms.push(toAdd);
    }
    rhythms.sort(function(a,b){
        return a - b;
    });
    
    var unsyncopated = unsyncopate(rhythms, beatsPer, []);
    var durations = convertToDuration(unsyncopated, beatsPer, []);
    //a function to find out where the 'near syncopations' are
    var beats = unsyncopated.map(function(current){
        return current % beatsPer;
    });
    var cantLengthen = longest(durations, beatsPer);
    var cantShorten = shortest(durations, shortestDuration);
    var measures = findMeasures(durations, beatsPer);
    var allMeasures = allMeasuresUsed(measures, numBarsLessOne);
    return {slots: unsyncopated, beatsPer: beatsPer, beats: beats, durations: durations, measures: measures, cantLengthen: cantLengthen,
        cantShorten: cantShorten, shortestDuration: shortestDuration, allMeasures: allMeasures, numBars: numBarsLessOne}

    //okay, for now, syncopations are allowed, but the objective function will frown upon them heavily

}

function allMeasuresUsed(measures, numBars){
    return measures.length === numBars;
}

function longest(durations, beatsPer){
    //places where nexthierarchic beat returns the current duration
    //return the indices of the durations that can't be lengthened
    var result = [];
    var currentBeat = 0;
    for (var i = 0; i < durations.length; i += 1){
        if (nextHierarchicBeat2(beatsPer, currentBeat) === durations[i]){
            result.push(i);
        }
        currentBeat += durations[i];
        currentBeat = currentBeat % beatsPer;
    }
    return result;
}

function shortest(durations, shortestDuration){
    var result = [];
    durations.forEach(function(current, index){
        if (current === shortestDuration){
            result.push(index);
        }
    });
    return result;

}

function unsyncopate(slots, beatsPer, soFar){ 
    if (slots.length === 1){
        //console.log(slots);
        return soFar.concat(slots[0]);
    }
    //recursively unsyncopate
    else {
        var dist = nextHierarchicBeat2(beatsPer, slots[0] % beatsPer);
        //dist should never send us farther than the next downbeat
        if (slots[1] - slots[0] > dist){
            slots[1] = slots[0] + dist;
        }
        soFar.push(slots[0]);
        //console.log(soFar);
        //return soFar.concat(unsyncopate(beats, beatsPer, soFar));
        return unsyncopate(slots.slice(1), beatsPer, soFar);
    }

}

function checkUnsyncopated(slots, beatsPer){
    return unsyncopate(slots, beatsPer, []).equals(slots);
}

function unsyncopateOnly8ths(slots, beatsPer, soFar){
    if (slots.length === 1){
        //console.log(slots);
        return soFar.concat(slots[0]);
    }
    //recursively unsyncopate
    else {
        if (slots[0] % 1 === 0.5){
            var dist = 0.5;
            if (slots[1] - slots[0] > dist){
                slots[1] = slots[0] + dist;
            }          
        }
        soFar.push(slots[0])
        return unsyncopateOnly8ths(slots.slice(1), beatsPer, soFar)

    }
}


function convertToDuration(slots, beatsPer, soFar){
    if (slots.length === 1){
        return soFar.concat(beatsPer - slots[0] % beatsPer)
    }

    else {
        var dist = slots[1] - slots[0];
        //dist should never send us farther than the next downbeat
        soFar.push(dist);
        //console.log(soFar);
        //return soFar.concat(unsyncopate(beats, beatsPer, soFar));
        return convertToDuration(slots.slice(1), beatsPer, soFar);
    }

}

function convertToSlots(durations, beatsPer){
    return durations.map(function(current, ind, arr){
        //console.log(arr.slice(0,ind));
        var sumSoFar = arr.slice(0,ind).reduce(function(a,b){
            return a + b;
        }, 0);

        return sumSoFar;
    });
}


// function groupByMeasure(durations){
//     var currentBar = 0;
//     var currentBeat = 0;
//     var lengths = durations.map(function(elem, ind, arr){

//     })
// }


function findFirstMeasure(durations, beatsPer){
    var oneMeasure = durations.reduce(function(prev, curr){
            if (prev.reduce(function(a, b){
                return a + b;
            }, 0) + curr > beatsPer){
                return prev;
            }
            else {
                return prev.concat(curr);
            }
        },[]);
    return oneMeasure;
}


function findMeasures(durations, beatsPer){
    if (durations.length === 0){
        return [];
    }
    //recurse
    var firstMeasure = findFirstMeasure(durations, beatsPer);
    var firstMeasureLength = firstMeasure.length;
    return [firstMeasure].concat(findMeasures(durations.slice(firstMeasureLength), beatsPer));
}


function move1(rhythms, firstIndex, secondIndex){
    //swaps the note value at firstindex and secondindex
    var durations = rhythms.durations;
    var first = durations[firstIndex];
    var second = durations[secondIndex];
    var copy = durations.map(function(current){
        return current;
    });
    copy[firstIndex] = second;
    copy[secondIndex] = first;
    var newSlots = convertToSlots(copy, rhythms.beatsPer);
    newSlots = unsyncopate(newSlots, rhythms.beatsPer, []);
    var newDurations = convertToDuration(newSlots, rhythms.beatsPer, []);
    var cantLengthen = longest(newDurations, rhythms.beatsPer);
    var cantShorten = shortest(newDurations, rhythms.shortestDuration);
    var measures = findMeasures(newDurations, rhythms.beatsPer);
    var allMeasures = allMeasuresUsed(measures, rhythms.numBars);
    return {slots: newSlots, beatsPer: rhythms.beatsPer, beats: newSlots.map(function(current){
        return current % rhythms.beatsPer;
    }), durations: newDurations, measures: measures, allMeasures: allMeasures, numBars: rhythms.numBars,
    cantShorten: cantShorten, cantLengthen: cantLengthen, shortestDuration: rhythms.shortestDuration};
}

function lengthen1(rhythms, index, addedDuration){
    //lengthen the noteValue at the given index by addedDuration amount
    //returns a new rhythms object, unsyncopated

    if (findLastEntryOf(rhythms.cantLengthen, index) !== -1){
        console.log('cant lengthen');
        return rhythms;
    }
    var durations = rhythms.durations.map(function(c){
        return c
    });
    durations[index] += addedDuration;
    // should we allow the last note to disappear or shorten the previous note if it does? and go back and so on?
    if (durations[durations.length - 1] > addedDuration){
        durations[durations.length - 1] = durations[durations.length - 1] - addedDuration;
    }
    else {
        //go back through the array and find the last note that's long enough to shorten
        var ind = durations.length - 1;
        var lastLength = durations[ind];
        while (lastLength <= addedDuration){
            ind = ind - 1;
            lastLength = durations[ind]
        }
        durations[ind] = durations[ind] - addedDuration;
    }
    var unsyncopated = unsyncopate(convertToSlots(durations), rhythms.beatsPer, []);
    var unsyncopatedDurations = convertToDuration(unsyncopated,rhythms.beatsPer,[]);
    var cantLengthen = longest(unsyncopatedDurations, rhythms.beatsPer);
    var cantShorten = shortest(unsyncopatedDurations, rhythms.shortestDuration);
    var measures = findMeasures(unsyncopatedDurations, rhythms.beatsPer);
    var allMeasures = allMeasuresUsed(measures, rhythms.numBars);
    if (!allMeasures){
        return rhythms;
    }
    return {slots: unsyncopated, beatsPer: rhythms.beatsPer, beats: unsyncopated.map(function(current){
        return current % rhythms.beatsPer;
    }), durations: unsyncopatedDurations, measures: measures, allMeasures: allMeasures, numBars: numBars,
    cantShorten: cantShorten, cantLengthen: cantLengthen, shortestDuration: rhythms.shortestDuration};    
    
}

function shorten1(rhythms, index, subDuration){
    if (findLastEntryOf(rhythms.cantShorten, index) !== -1){
        console.log('cant shorten');
        return rhythms;
    }
    var durations = rhythms.durations.map(function(c){
        return c
    });
    durations[index] = durations[index] - subDuration;
    var unsyncopated = unsyncopate(convertToSlots(durations), rhythms.beatsPer, []);
    var unsyncopatedDurations = convertToDuration(unsyncopated,rhythms.beatsPer,[]);
    var cantLengthen = longest(unsyncopatedDurations, rhythms.beatsPer);
    var cantShorten = shortest(unsyncopatedDurations, rhythms.shortestDuration);
    var measures = findMeasures(unsyncopatedDurations, rhythms.beatsPer);
    var allMeasures = allMeasuresUsed(measures, rhythms.numBars);
    if (!allMeasures){
        return rhythms;
    }
    return {slots: unsyncopated, beatsPer: rhythms.beatsPer, beats: unsyncopated.map(function(current){
        return current % rhythms.beatsPer;
    }), durations: unsyncopatedDurations, measures: measures, allMeasures: allMeasures, numBars: numBars,
    cantShorten: cantShorten, cantLengthen: cantLengthen, shortestDuration: rhythms.shortestDuration};    
}




function VNSRhythmScore(rhythms, melody){
    //var scaleDegrees = melody.scaleDegrees;
    var scores = [];

    // var evennessSubscore = getEvennessSubscore(rhythms);
    // scores.push(evennessSubscore);

    // var leapsSubscore = getLeapsSubscore(rhythms, melody);
    // scores.push(leapsSubscore);


    var motiveSubscore = getMotiveSubscore(rhythms);
    scores.push(motiveSubscore);

    // var climaxSubscore = getClimaxSubscore(rhythms, melody);
    // scores.push(climaxSubscore);
    return scores.reduce(function(p, c){
        return p + c
    }, 0);

}

function getEvennessSubscores(rhythms){
    //define evenness by measure
}

function getMotiveSubscore(rhythms){
    // look at each measure and see how close they are to each other
    var measures = rhythms.measures;
    var measuresSlotted = measures.map(function(current){
        return convertToSlots(current);
    });
    var scores = [];
    //want some similar, some contrast too
    //n choose 2 similarity scores
    var numComparisons = 0;
    for (var i = 0; i < measuresSlotted.length - 1; i += 1){
        for (var j = i + 1; j < measuresSlotted.length; j += 1){
            var longer = measuresSlotted[i].length > measuresSlotted[j].length ? i : j;
            var shorter = longer === i ? j : i;
            var score = 1 - numSameEntries(measuresSlotted[longer], measuresSlotted[shorter]) / measuresSlotted[longer].length;
            scores.push(score);
            numComparisons += 1;
        }
    }
    var total = scores.reduce(function(a,b, ind, arr){
        return a + b;
    }, 0);
    return total / numComparisons;
}


function RN1min(rhythms){
    //console.log('scale degrees passed to n1min function');
    //console.log(scaleDegrees);
    var best = rhythms;
    var VNSscore = VNSRhythmScore(rhythms);
    //dont swap out first note, tonic
    for (var i = 0; i < rhythms.durations.length - 1; i += 1){
        for (var j = i + 1; j < rhythms.durations.length; j+= 1){
            var swapped = move1(rhythms, i, j);
            //console.log(swapped);
            var score = VNSRhythmScore(swapped);
            console.log(score);
            //console.log(score);
            if (score < VNSscore){

                VNSscore = score;
                best = swapped;
       
            }
        }
    }
    return best;
}



