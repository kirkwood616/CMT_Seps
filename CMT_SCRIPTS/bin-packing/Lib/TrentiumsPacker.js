/**
 * TrentiumsPacker.js
 *
 * By trentium: https://stackoverflow.com/users/7696162/trentium
 * from here: https://stackoverflow.com/questions/56642111/bin-packing-js-implementation-using-box-rotation-for-best-fit
 *
 * Modified to conform to ExtendScript syntax and
 * functionality I wanted such as changing the
 * packer's orientation.
 *
 * @author trentium (original code)
 * @author m1b
 * @version 2025-06-01
 */


/**
 * The orientation of the packer with values dictating
 * how to interpret the packed coordinates.
 * @enum {Object}
 */
var PackingOrientation = {
    ROW_TOP_LEFT: { flipX: false, flipY: false, toString: function () { return 'ROW_TOP_LEFT'; } },
    ROW_TOP_RIGHT: { flipX: true, flipY: false, toString: function () { return 'ROW_TOP_RIGHT'; } },
    ROW_BOTTOM_LEFT: { flipX: false, flipY: true, toString: function () { return 'ROW_BOTTOM_LEFT'; } },
    ROW_BOTTOM_RIGHT: { flipX: true, flipY: true, toString: function () { return 'ROW_BOTTOM_RIGHT'; } },
};

/**
 * Helper to provide 2D rectangular bin packings.
 * @constructor
 * @param {Number} w - width of the packing area.
 * @param {Number} h - height of the packing area.
 * @param {PackingOrientation} orientation - the orientation of the packing.
 * @param {Boolean} allow90DegreeRotation - whether to allow 90 degree rotations of the blocks.
 */
function TrentiumsPacker(w, h, orientation, allow90DegreeRotation) {

    this.orientation = orientation || PackingOrientation.ROW_TOP_LEFT;
    this.allow90DegreeRotation = (true === allow90DegreeRotation);

    this.w = w;
    this.h = h;

    this.init(this.w, this.h);

};

/**
 * Initialise the packing area.
 * @param {Number} w - the width of the packing area.
 * @param {Number} h - the height of the packing area.
 */
TrentiumsPacker.prototype.init = function (w, h) {

    this._root = { x: 0, y: 0, w: w, h: h };

};

/**
 * Returns the intersecting block of block0 and block1.
 * @param {block} block0
 * @param {block} block1
 * @returns {block?}
 */
TrentiumsPacker.prototype.intersect = function (block0, block1) {

    var ix0 = Math.max(block0.x0, block1.x0);
    var ix1 = Math.min(block0.x1, block1.x1);
    var iy0 = Math.max(block0.y0, block1.y0);
    var iy1 = Math.min(block0.y1, block1.y1);

    if (ix0 <= ix1 && iy0 <= iy1) {
        return { x0: ix0, y0: iy0, x1: ix1, y1: iy1 };
    } else {
        return null;
    }

};

/**
 * Determine whether heapBlock0 totally encompasses (ie, contains) heapBlock1.
 * @param {block} heapBlock0
 * @param {block} heapBlock1
 * @returns {Boolean}
 */
TrentiumsPacker.prototype.chunkContains = function (heapBlock0, heapBlock1) {

    return heapBlock0.x0 <= heapBlock1.x0 && heapBlock0.y0 <= heapBlock1.y0 && heapBlock1.x1 <= heapBlock0.x1 && heapBlock1.y1 <= heapBlock0.y1;

};

/**
 * Extend heapBlock0 and heapBlock1 if they are adjoining or overlapping.
 * @param {block} heapBlock0
 * @param {block} heapBlock1
 */
TrentiumsPacker.prototype.expand = function (heapBlock0, heapBlock1) {

    if (heapBlock0.x0 <= heapBlock1.x0 && heapBlock1.x1 <= heapBlock0.x1 && heapBlock1.y0 <= heapBlock0.y1) {
        heapBlock1.y0 = Math.min(heapBlock0.y0, heapBlock1.y0);
        heapBlock1.y1 = Math.max(heapBlock0.y1, heapBlock1.y1);
    }

    if (heapBlock0.y0 <= heapBlock1.y0 && heapBlock1.y1 <= heapBlock0.y1 && heapBlock1.x0 <= heapBlock0.x1) {
        heapBlock1.x0 = Math.min(heapBlock0.x0, heapBlock1.x0);
        heapBlock1.x1 = Math.max(heapBlock0.x1, heapBlock1.x1);
    }

};

/**
 * Expand blocks.
 * @param {block} heapBlock0
 * @param {block} heapBlock1
 */
TrentiumsPacker.prototype.unionMax = function (heapBlock0, heapBlock1) {

    // Given two heap blocks, determine whether...
    if (heapBlock0 && heapBlock1) {

        // ...heapBlock0 and heapBlock1 intersect, and if so...
        var i = this.intersect(heapBlock0, heapBlock1);

        if (i) {

            if (this.chunkContains(heapBlock0, heapBlock1)) {
                // ...if heapBlock1 is contained by heapBlock0...
                heapBlock1 = null;
            } else if (this.chunkContains(heapBlock1, heapBlock0)) {
                // ...or if heapBlock0 is contained by heapBlock1...
                heapBlock0 = null;
            } else {
                // ...otherwise, var's expand both heapBlock0 and
                // heapBlock1 to encompass as much of the intersected
                // space as possible.  In this instance, both heapBlock0
                // and heapBlock1 will overlap.
                this.expand(heapBlock0, heapBlock1);
                this.expand(heapBlock1, heapBlock0);
            }

        }

    }

};

/**
 * Loop through the entire heap, looking to eliminate duplicative
 * heapBlocks, and to extend adjoining or intersecting heapBlocks,
 * despite this introducing overlapping heapBlocks.
 */
TrentiumsPacker.prototype.unionAll = function () {

    for (var i = 0; i < this.heap.length; i++) {
        for (var j = 0; j < this.heap.length; j++) {
            if (i !== j) {
                this.unionMax(this.heap[i], this.heap[j]);
                if (this.heap[i] && this.heap[j]) {
                    if (this.chunkContains(this.heap[j], this.heap[i])) {
                        this.heap[i] = null;
                    } else if (this.chunkContains(this.heap[i], this.heap[j])) {
                        this.heap[j] = null;
                    }
                }
            }
        }
    }

    // Eliminate the duplicative (ie, nulled) heapBlocks.
    var onlyBlocks = [];
    for (var i = 0; i < this.heap.length; i++) {
        if (this.heap[i]) {
            onlyBlocks.push(this.heap[i]);
        }
    }

    this.heap = onlyBlocks;

};

/**
 * Find a heapBlock that can contain the block.
 * @param {block} block
 * @returns {Boolean} - true if the block was packed, false otherwise.
 */
TrentiumsPacker.prototype.findInHeap = function (block) {

    for (var i = 0; i < this.heap.length; i++) {

        var heapBlock = this.heap[i];

        if (
            heapBlock
            && block.w <= heapBlock.x1 - heapBlock.x0
            && block.h <= heapBlock.y1 - heapBlock.y0
        ) {
            block.x0 = heapBlock.x0;
            block.y0 = heapBlock.y0;
            block.x1 = heapBlock.x0 + block.w;
            block.y1 = heapBlock.y0 + block.h;
            block.packed = true;

            return true;
        }

    }

    return false;

};

/**
 * Find all heap entries that intersect with block,
 * and adjust the heap by breaking up the heapBlock
 * into the possible 4 blocks that remain after
 * removing the intersecting portion.
 * @param {block} block
 */
TrentiumsPacker.prototype.adjustHeap = function (block) {

    var n = this.heap.length;

    for (var i = 0; i < n; i++) {
        var heapBlock = this.heap[i];
        var overlap = this.intersect(heapBlock, block);
        if (overlap) {

            // Top
            if (overlap.y1 !== heapBlock.y1) {
                this.heap.push({
                    x0: heapBlock.x0,
                    y0: overlap.y1,
                    x1: heapBlock.x1,
                    y1: heapBlock.y1
                });
            }

            // Right
            if (overlap.x1 !== heapBlock.x1) {
                this.heap.push({
                    x0: overlap.x1,
                    y0: heapBlock.y0,
                    x1: heapBlock.x1,
                    y1: heapBlock.y1
                });
            }

            // Bottom
            if (heapBlock.y0 !== overlap.y0) {
                this.heap.push({
                    x0: heapBlock.x0,
                    y0: heapBlock.y0,
                    x1: heapBlock.x1,
                    y1: overlap.y0
                });
            }

            // Left
            if (heapBlock.x0 != overlap.x0) {
                this.heap.push({
                    x0: heapBlock.x0,
                    y0: heapBlock.y0,
                    x1: overlap.x0,
                    y1: heapBlock.y1
                });
            }

            this.heap[i] = null;
        }
    }

    this.unionAll();

};

/**
 * Empty the current heap and set the bin size.
 */
TrentiumsPacker.prototype.reset = function (w, h) {
    this.heap = null;
    this.w = w;
    this.h = h;
    this.init(w, h);
};

/**
 * Loop through all the blocks, looking for a heapBlock
 * that it can fit into.
 * @param {Array<block>} blocks - the blocks to fit.
 * @param {Bin} bin - the bin.
 * @returns {Object} - {orientation: packedBlocks: remainingBlocks: }.
 */
TrentiumsPacker.prototype.fit = function fit(blocks, bin) {

    this.heap = [{
        x0: 0,
        y0: 0,
        x1: this._root.w,
        y1: this._root.h
    }];

    var packedBlocks = [],
        remainingBlocks = [];

    for (var n = 0, block; n < blocks.length; n++) {

        block = blocks[n];

        if (this.findInHeap(block)) {
            this.adjustHeap(block);
        }

        else if (this.allow90DegreeRotation) {
            // If the block didn't fit in its current orientation,
            // rotate its dimensions and look again.
            block.rotate();

            if (this.findInHeap(block)) {
                this.adjustHeap(block);
            }

        }

        if (block.packed) {
            packedBlocks.push(block);
        }
        else {
            remainingBlocks.push(block);
        }

    }

    return {
        orientation: this.orientation,
        packedBlocks: transformBlocks(packedBlocks, this.orientation, bin),
        remainingBlocks: remainingBlocks,
    };

};

/**
 * Returns a transformed copy of `blocks` array,
 * transforming each copied block from ROW_TOP_LEFT
 * to the target orientation.
 * @param {Array<Block>} blocks - the blocks to transform.
 * @param {PackingOrientation} orientation - the target orientation.
 * @param {Bin} bin - the bin associated with this block.
 * @returns {Array<Block>} - a transformed copy of `blocks`.
 */
function transformBlocks(blocks, orientation, bin) {

    if (PackingOrientation.ROW_TOP_LEFT === orientation)
        // the default orientation needs no transformation
        return blocks.slice();

    var transformedBlocks = [];

    var flipX = orientation.flipX;
    var flipY = orientation.flipY;

    for (var i = 0, b, x0, y0, x1, y1, newBlock; i < blocks.length; i++) {

        b = blocks[i];
        x0 = b.x0;
        y0 = b.y0;
        x1 = b.x1;
        y1 = b.y1;

        if (flipX) {
            x0 = bin.width - x1;
            x1 = bin.width - x0;
        }

        if (flipY) {
            y0 = bin.height - y1;
            y1 = bin.height - y0;
        }

        // create the transformed block
        newBlock = b.duplicate();

        // update the block's transformed coordinates
        newBlock.x0 = x0;
        newBlock.y0 = y0;
        newBlock.x1 = x1;
        newBlock.y1 = y1;

        transformedBlocks.push(newBlock);

    }

    return transformedBlocks;

};