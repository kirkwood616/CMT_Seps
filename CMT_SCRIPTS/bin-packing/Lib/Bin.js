/**
 * @file Bin.js
 *
 * A packing bin.
 *
 * @author m1b
 * @version 2025-07-24
 */

/**
 * A packing bin.
 * @author m1b
 * @version 2025-07-24
 * @constructor
 * @param {Object} options
 * @param {point} options.x0 - left bin rectangle coordinate [x,y].
 * @param {point} options.y0 - top bin rectangle coordinate [x,y].
 * @param {point} options.x1 - right bin rectangle coordinate [x,y].
 * @param {point} options.y1 - bottom bin rectangle coordinate [x,y].
 * @param {Number|Array<Number>} options.margin - the bin's margin, in points, can be array of [x0,y0,x1,y1] (the bin will be smaller by this amount).
 * @param {Number} options.padding - the bin's padding setting, in points (this is required to position the blocks correctly).
 * @param {Artboard|Page} [options.referenceItem] - a reference item for this bin.
 */
function Bin(options) {

    options = options || {};

    if ('String' === options.margin.constructor.name)
        options.margin = getUnitStringAsPoints(options.margin) || 0;

    if ('String' === options.padding.constructor.name)
        options.padding = getUnitStringAsPoints(options.padding) || 0;

    if ('number' === typeof options.margin)
        options.margin = [options.margin, options.margin, options.margin, options.margin];

    this.margin = options.margin;
    this.padding = options.padding;

    // fundamental bin size, ignoring margins and padding
    this.X0 = options.x0;
    this.Y0 = options.y0;
    this.X1 = options.x1;
    this.Y1 = options.y1;

    // working bin size, will include margins and padding
    this.x0 = options.x0;
    this.y0 = options.y0;
    this.x1 = options.x1;
    this.y1 = options.y1;

    this.setMetrics();

    this.referenceItem = options.referenceItem;

};

/**
 * Sets the Bin's margin.
 * @author m1b
 * @version 2025-07-24
 * @param {Number|Array<Number>} [margin] - the margin to allow on each edge of the bin.
 */
Bin.prototype.setMetrics = function setMetrics(margin, padding) {

    if (undefined != margin) {

        if (
            'Array' === margin.constructor.name
            && 4 === margin.length
        )
            this.margin = margin;

        else if ('String' === margin.constructor.name)
            margin = getUnitStringAsPoints(margin)

        if (
            'Number' === margin.constructor.name
            && !isNaN(margin)
        )
            this.margin = [margin, margin, margin, margin];

    }

    if (undefined != padding) {

        if ('String' === padding.constructor.name)
            padding = getUnitStringAsPoints(padding)

        if (
            'Number' === padding.constructor.name
            && !isNaN(padding)
        )
            this.padding = padding;

    }

    this.x0 = this.X0 + this.margin[0];
    this.y0 = this.Y0 + this.margin[1];
    this.x1 = this.X1 - this.margin[2];
    this.y1 = this.Y1 - this.margin[3];

    // internal properties
    this.width = (this.x1 - this.x0);
    this.height = (this.y1 - this.y0);
    this.area = this.width * this.height;

    // add padding the bin dimensions to make the fitting easier to calculate
    this.width += this.padding;
    this.height += this.padding;

};

/**
 * Returns a string representation of the Bin.
 * @returns {String}
 */
Bin.prototype.toString = function binToString() {

    var name = this.referenceItem && this.referenceItem.name;
    return '[Bin ' + this.width + ' x ' + this.height + (name ? ' "' + name + '"' : '') + ']';

};

/**
 * Returns `str` converted to points.
 * eg. '10 mm' returns 28.34645669,
 *     '1 inch' returns 72
 * @author m1b
 * @version 2024-09-10
 * @param {String} str - the string to parse.
 * @returns {Number}
 */
function getUnitStringAsPoints(str) {

    if ('Number' === str.constructor.name)
        return str;

    var rawNumber = Number((str.match(/[\d.-]+/) || 0)[0])

    if (isNaN(rawNumber))
        return;

    var convertToPoints = 1;

    if (str.search(/mm/) != -1)
        convertToPoints = 2.834645669;

    else if (str.search(/cm/) != -1)
        convertToPoints = 28.34645669;

    else if (str.search(/(in|inch|\")/) != -1)
        convertToPoints = 72;

    return (rawNumber * convertToPoints);

};