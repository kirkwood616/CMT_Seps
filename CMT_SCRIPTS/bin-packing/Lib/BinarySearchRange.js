/**
 * @file BinarySearchRange.js
 *
 * A binary search helper to find a value within a specified range.
 *
 * @author m1b
 * @version 2025-06-13
 */

/**
 * Makes a binary search helper to find a value within a specified range.
 * @author m1b
 * @version 2025-06-13
 * @param {Number} min - the minimum value of the range.
 * @param {Number} max - the maximum value of the range.
 * @param {Number} threshold - the minimum difference between min and max to continue searching.
 * @param {Number} maxSteps - after this number of steps, the search will end, no matter how close it got.
 */
function BinarySearchRange(min, max, threshold, maxSteps) {

    this.min = min;
    this.max = max;
    this.maxSteps = maxSteps || Infinity;
    this.threshold = threshold || 1;
    this.lastGuess = null;
    this.stepCounter = 0;

};

/**
 * Returns true if the search is still ongoing,
 * ie. the difference between max and min is greater
 * than the threshold and not exceeding the maximum.
 * @author m1b
 * @version 2025-06-13
 * @returns {Boolean}
 */
BinarySearchRange.prototype.searching = function () {

    return (
        (this.max - this.min) > this.threshold
        && this.stepCounter < this.maxSteps
    );

};

/**
 * Performs a step in the binary search.
 * @author m1b
 * @version 2025-06-13
 * @param {Function} testFunction - a function to evaluate the search at each iteration, returning the boolean (testValue >= lastGuess).
 * @returns {Object} - the test result {guess:Number, success:Boolean}
 */
BinarySearchRange.prototype.step = function searchStep(testFunction) {

    this.stepCounter++;
    this.lastGuess = (this.min + this.max) / 2;

    // $.writeln('this.min = ' + this.min + '   this.max = ' + this.max);

    var success = testFunction(this.lastGuess);

    if (success)
        this.max = this.lastGuess;
    else
        this.min = this.lastGuess;

    return {
        guess: this.lastGuess,
        success: success
    };

};