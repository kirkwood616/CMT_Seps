/**
 * @file PackingAttempt.js
 *
 * The PackingAttempt object represents an attempt to pack an array of blocks into an array of bins.
 */


/**
 * Creates a "packing attempt" for a Bin.
 * The PackingAttempt object represents an attempt
 * to pack an array of blocks into an array of bins.
 * @param {Bin} bin - the bins in use.
 * @returns {PackingAttempt}
 */
function PackingAttempt(blocks, bins, id) {

    this.allBlocks = blocks.slice();
    this.remainingBlocks = blocks.slice();
    this.id = id;
    this.allBins = bins.slice();
    this.binIndex = -1;

    // packings will be added using the `addPacking` method
    this.packings = [];

    // calculate the total block area, used for efficiency scoring later
    this.allBlocksArea = getBlocksArea(this.allBlocks);

    // no score yet
    this.score = -1;

};

/**
 * String representation of the PackingAttempt.
 * @returns {String}
 */
PackingAttempt.prototype.toString = function () {
    return '[PackingAttempt "' + this.id + '" score: ' + this.score.toFixed(4) + ']';
};

/**
 * Adds a packing to the attempt.
 * @param {BinPacking} packing - a bin packing object.
 */
PackingAttempt.prototype.addPacking = function (packing) {

    this.packings.push(packing);

    // update the remaining blocks
    this.remainingBlocks = packing.remainingBlocks.slice();

};

/**
 * Prepares and returns the next empty bin.
 * @returns {Bin?}
 */
PackingAttempt.prototype.nextBin = function () {

    this.binIndex++;

    var bin = this.allBins[this.binIndex];

    if (!bin)
        // no bins left
        return;

    return bin;

};

/**
 * Returns a score for the given attempt.
 * @param {Object} packing - the packing object to score.
 * @returns {Number}
 */
PackingAttempt.basicScoringMethod = function (attempt) {

    // limit significant decimal places
    var places = 1e4;

    var totalPackedBlocksArea = 0,
        totalBinsArea = 0,
        totalRemainingBlocksArea = getBlocksArea(attempt.remainingBlocks);

    for (var i = 0; i < attempt.packings.length; i++) {

        var packing = attempt.packings[i];

        // $.writeln('scoring #' + i + ' packing.remainingBlocks.length = ' + packing.remainingBlocks.length);

        totalPackedBlocksArea += getBlocksArea(packing.packedBlocks);
        totalBinsArea += packing.bin.area;

    }

    if (
        totalBinsArea === 0
        || totalPackedBlocksArea + totalRemainingBlocksArea === 0
    )
        return 0;

    // judge the score based on these criteria
    var completion = totalPackedBlocksArea / (totalPackedBlocksArea + totalRemainingBlocksArea);
    var efficiency = totalPackedBlocksArea / totalBinsArea;

    // weighted like this
    var weightCompletion = 2.0,
        weightEfficiency = 1.0;

    attempt.score = Math.pow(completion, weightCompletion) * Math.pow(efficiency, weightEfficiency);

    return attempt.score;

};

/**
 * Adds up the attempt's packings' scores
 * and updates its overall score.
 * @returns {Number} - the attempts overall score.
 */
PackingAttempt.prototype.getScore = function getScore(scoringMethod) {

    scoringMethod = scoringMethod || PackingAttempt.basicScoringMethod;

    return scoringMethod(this);

};

/**
 * Sorting function to rank highest scoring attempt first.
 */
PackingAttempt.getBestAttempt = function getBestAttempt(attempts, scoringMethod) {

    scoringMethod = scoringMethod || PackingAttempt.basicScoringMethod;

    var bestAttempt,
        bestScore = -Infinity;

    for (var i = 0; i < attempts.length; i++) {

        if (attempts[i].getScore(scoringMethod) > bestScore) {
            bestAttempt = attempts[i];
            bestScore = bestAttempt.score;
        }

    }

    return bestAttempt;

};

/**
 * Returns sum of area of `blocks`.
 * @param {Array<Block>} blocks - the blocks to measure.
 * @returns {Number}
 */
function getBlocksArea(blocks) {

    var area = 0;

    for (var i = 0; i < blocks.length; i++)
        area += blocks[i].area;

    return area;

};