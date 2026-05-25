/**
 * @file Block.js
 *
 * An object representing an item's block during 2D Bin Packing.
 */

/**
 * Blocks are used to by the packer, and each block represents an item.
 * @author m1b
 * @version 2025-06-08
 * @constructor
 * @param {PageItem} item - the block's page item.
 * @param {Number} padding - the space between items, in points.
 * @param {PackingAdapter} packingAdapter - the block's packing adapter, eg Illustrator, or Indesign.
 * @param {Function} [initializer] - a function that takes the new block as parameter (default: none).
 */
function Block(item, padding, packingAdapter, initializer) {

    this.item = item;
    this.padding = padding || 0;
    this.isRotated = false;
    this.packingAdapter = packingAdapter;

    // these properties will be set by the packing adapter
    this.area = undefined;
    this.bounds = undefined;
    this.w = undefined;
    this.h = undefined;
    this.dimensions = undefined;
    this.rotatedDimensions = undefined;

    packingAdapter.initializeBlock(this, initializer);

};

/**
 * Returns a cloned version of the Block.
 * The clone will only have the basic properties
 * of the original, unless `properties` are
 * supplied, which can be a Block itself.
 * @param {Object|Block} properties - the properties to apply to the cloned Block.
 * @returns {Block}
 */
Block.prototype.clone = function cloneBlock(properties) {

    properties = properties || {};

    var clone = new Block(this.item, this.padding, this.packingAdapter);

    for (var key in properties)
        if (properties.hasOwnProperty(key))
            clone[key] = properties[key];

    return clone;

};

/**
 * Returns a duplicate of the block.
 * @returns {Block}
 */
Block.prototype.duplicate = function duplicateBlock() {

    // passing the block itself to the clone method
    // will apply all its current properties to the
    // clone, which is equivalent to making a duplicate
    return this.clone(this);

};

// swap block between 0 and 90 degree rotation
Block.prototype.rotate = function () {

    if (this.w === this.h)
        return;

    this.isRotated = !this.isRotated;
    this.w = this.isRotated ? this.rotatedDimensions.w : this.dimensions.w;
    this.h = this.isRotated ? this.rotatedDimensions.h : this.dimensions.h;

};

// just for debugging
Block.prototype.toString = function () {

    var name = this.item && (this.item.name ? '"' + this.item.name + '"' : '');

    if (!this.packed)
        return '[Block, not packed' + (name ? ' ' + name : '') + ']';

    return '[Block'
        + ' x0:' + Number(this.x0.toFixed(2))
        + ' x1:' + Number(this.x1.toFixed(2))
        + ' y0:' + Number(this.y0.toFixed(2))
        + ' y1:' + Number(this.y1.toFixed(2))
        + (this.isRotated ? ' Rotated' : '')
        + (name ? ' ' + name : '')
        + ']';

};

Block.sortByAreaDescending = function (a, b) { return b.area - a.area };
Block.sortByAreaAscending = function (a, b) { return a.area - b.area };
Block.sortByLargestDimension = function (a, b) { return Math.max(b.w, b.h) - Math.max(a.w, a.h) };
Block.sortByWidth = function (a, b) { return b.w - a.w };
Block.sortByHeight = function (a, b) { return b.h - a.h };
