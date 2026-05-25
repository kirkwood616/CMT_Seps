/**
 * @file BinPacking.js
 *
 * An object to represent a single packing of a single Bin.
 */


/**
 * A BinPacking represents a packing of blocks into a single bin.
 * @param {Bin} bin - the packed bin.
 * @param {Object} packingResult - an object returned by TrentiumsPacker.
 * @returns {BinPacking}
 */
function BinPacking(bin, packingResult) {

    this.bin = bin;

    packingResult = packingResult || {};

    this.packedBlocks = packingResult.packedBlocks;
    this.remainingBlocks = packingResult.remainingBlocks;
    this.orientation = packingResult.orientation;

    // anything else from the packing result
    for (var key in packingResult)
        if (packingResult.hasOwnProperty(key))
            this[key] = packingResult[key]

    // no score yet
    this.score = -1;

};

/**
 * String representation of the BinPacking.
 * @returns {String}
 */
BinPacking.prototype.toString = function () {
    return '[BinPacking ' + this.packedBlocks.length + ' packed / ' + this.remainingBlocks.length + ' remaining]';
};

/**
 * Calculates a score for the packing,
 * prioritizing completion over efficiency.
 * @author m1b
 * @version 2025-06-22
 */
BinPacking.prototype.updateScore = function updateScore() {

    // note `packingHeight` may be less than `this.bin.height`
    var packingHeight = this.height || this.bin.height;

    // packing score is ratio of packed area to bin area plus unpacked block area
    this.score = (getBlocksArea(this.packedBlocks)) / ((this.bin.width * packingHeight) + getBlocksArea(this.remainingBlocks));

    // minus a penalty for unpacked blocks
    this.score -= 0.01 * this.remainingBlocks.length;

};
