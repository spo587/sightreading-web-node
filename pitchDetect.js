var MIN_SAMPLES = 0;  // will be initialized when AudioContext is created.

exports.MIN_SAMPLES = MIN_SAMPLES;

exports.autoCorrelate = function( buf, sampleRate ) {
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


exports.noteFromPitch = function( frequency ) {
    var noteNum = 12 * (Math.log( frequency / 440 )/Math.log(2) );
    return Math.round( noteNum ) + 69;
}


exports.makeSubArrays = function(arr, numSlices){
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

