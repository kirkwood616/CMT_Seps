/**
 * @file IllustratorPackingAdapter.js
 *
 * The IllustratorPackingAdapter provides an interface to convert between
 * Illustrator page items and the packing blocks used by the packing algorithm,
 * as well as creating packing Bins from Illustrator artboards.
 */

function IllustratorPackingAdapter() { };

/**
 * Prepares Illustrator for packing.
 * @author m1b
 * @version 2025-06-08
 */
IllustratorPackingAdapter.init = function (doc) {

    // app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;
    app.coordinateSystem = CoordinateSystem.DOCUMENTCOORDINATESYSTEM;
    IllustratorPackingAdapter.doc = doc;

};

/**
 * Returns array of bins derived from the given artboards.
 * @author m1b
 * @version 2025-06-08
 * @param {Artboard|Artboards|Array<Artboard>} artboards - the artboards to make bins from.
 * @param {Number} margin - the margin to leave around the artboard.
 * @param {Number} padding - the padding to leave around blocks when packing this bin.
 * @returns {Array<Bin>}
 */
IllustratorPackingAdapter.makeBinFromArtboard = function (artboard, margin, padding) {

    var x0 = artboard.artboardRect[0],
        y0 = -artboard.artboardRect[1],
        x1 = artboard.artboardRect[2],
        y1 = -artboard.artboardRect[3];

    return new Bin({
        x0: x0,
        y0: y0,
        x1: x1,
        y1: y1,
        margin: margin,
        padding: padding,
        referenceItem: artboard,
    });

};

/**
 * Rotate the block's item such its bounding box
 * represents the smallest area possible.
 *
 * Common usage: Pass this as an `initializer`
 * function when creating a new Block.
 *
 * @author m1b
 * @version 2025-06-29
 * @param {Block} block - the item's block.
 */
IllustratorPackingAdapter.rotateItemToFitSmallestRectangle = function (block) {

    if (Math.abs(block.w - block.h) < 1)
        // no point rotating a square
        return;

    var item = block.item,
        angle = findRotationByMinimalBoundsIllustrator(item);

    if (Math.abs(angle % 90) < 1)
        // don't bother with tiny rotations
        return;

    item.rotate(- angle);

};

/**
 * Initializes the block for this packing adapter.
 * @author m1b
 * @version 2025-06-29
 * @param {Block} block - the block to initialize.
 * @param {Function} [initializer] - a function that takes the new block as parameter (default: none).
 */
IllustratorPackingAdapter.initializeBlock = function (block, initializer) {

    if ('function' === typeof initializer)
        initializer(block);

    // get a more accurate bounds
    block.visibleBounds = block.item.visibleBounds;
    block.improvedBounds = getItemBoundsIllustrator(block.item, false);

    block.w = block.improvedBounds[2] - block.improvedBounds[0] + block.padding;
    block.h = -(block.improvedBounds[3] - block.improvedBounds[1]) + block.padding;

    // area
    block.area = block.w * block.h;

    // dimensions
    block.dimensions = {
        w: block.w,
        h: block.h,
    };

    block.rotatedDimensions = {
        w: block.h,
        h: block.w,
    };

};

/**
 * Adds item stats to the given `packingItem` object.
 * @author m1b
 * @version 2025-06-08
 * @param {Block} block - the packing item object.
 * @param {Bin} bin - the item's packing bin.
 * @param {Object} settings - the item's packing bin.
 */
IllustratorPackingAdapter.positionItem = function (block, bin, settings) {

    var item = block.item;

    // the offset between the visible bounds and the improved bounds
    var dx, dy;

    if (block.isRotated) {
        dx = -(block.visibleBounds[1] - block.improvedBounds[1]);
        dy = block.visibleBounds[2] - block.improvedBounds[2];
        item.rotate(90);
    }
    else {
        dx = block.visibleBounds[0] - block.improvedBounds[0];
        dy = block.visibleBounds[1] - block.improvedBounds[1];
    }

    if (settings.showBlockBounds)
        drawRectangleIllustrator(block.item.parent, [
            bin.x0 + block.x0,
            bin.y0 + block.y0,
            block.w - bin.padding,
            block.h - bin.padding,
        ], {
            stroked: true,
            strokeWidth: 0.1,
            name: item.name,
        });

    if (!settings.moveItems)
        return;

    var l = bin.x0 + block.x0 + dx,
        t = -(bin.y0 + block.y0) + dy,
        r = bin.x0 + block.x1 + dx,
        b = -(bin.y0 + block.y1) + dy;

    // position the item
    item.left = l;
    item.top = t;

};

/**
 * Returns bounds of item(s).
 * @author m1b
 * @version 2024-03-10
 * @param {PageItem|Array<PageItem>} item - an Illustrator PageItem or array of PageItems.
 * @param {Boolean} [geometric] - if false, returns visible bounds.
 * @param {Array} [bounds] - private parameter, used when recursing.
 * @returns {Array} - the calculated bounds.
 */
function getItemBoundsIllustrator(item, geometric, bounds) {

    var newBounds = [],
        boundsKey = geometric ? 'geometricBounds' : 'visibleBounds';

    if (undefined == item)
        return;

    if (
        item.typename == 'GroupItem'
        || item.constructor.name == 'Array'
    ) {

        var children = item.typename == 'GroupItem' ? item.pageItems : item,
            contentBounds = [],
            isClippingGroup = (item.hasOwnProperty('clipped') && item.clipped == true),
            clipBounds;

        for (var i = 0, child; i < children.length; i++) {

            child = children[i];

            if (
                child.hasOwnProperty('clipping')
                && true === child.clipping
            )
                // the clipping item
                clipBounds = child.geometricBounds;

            else
                contentBounds.push(getItemBoundsIllustrator(child, geometric, bounds));

        }

        newBounds = combineBoundsIllustrator(contentBounds);

        if (isClippingGroup)
            newBounds = intersectionOfBoundsIllustrator([clipBounds, newBounds]);

    }

    else if (
        'TextFrame' === item.constructor.name
        && TextType.AREATEXT !== item.kind
    ) {

        // get bounds of outlined text
        var dup = item.duplicate().createOutline();
        newBounds = dup[boundsKey];
        dup.remove();

    }

    else if (item.hasOwnProperty(boundsKey)) {

        newBounds = item[boundsKey];

    }

    // `bounds` will exist if this is a recursive execution
    bounds = (undefined == bounds)
        ? bounds = newBounds
        : bounds = combineBoundsIllustrator([newBounds, bounds]);

    return bounds;

};

/**
 * Returns the combined bounds of all bounds supplied.
 * @author m1b
 * @version 2024-03-09
 * @param {Array<bounds>} boundsArray - an array of bounds [L, T, R, B].
 * @returns {bounds?} - the combined bounds.
 */
function combineBoundsIllustrator(boundsArray) {

    var combinedBounds = boundsArray[0].slice();

    // iterate through the rest of the bounds
    for (var i = 1, b; i < boundsArray.length; i++) {

        b = boundsArray[i];

        combinedBounds = [
            Math.min(combinedBounds[0], b[0]),
            Math.max(combinedBounds[1], b[1]),
            Math.max(combinedBounds[2], b[2]),
            Math.min(combinedBounds[3], b[3]),
        ];

    }

    return combinedBounds;

};

/**
 * Returns the overlapping rectangle
 * of two or more rectangles.
 * NOTE: Returns undefined if ANY
 * rectangles do not intersect.
 * @author m1b
 * @version 2024-09-05
 * @param {Array<bounds>} arrayOfBounds - an array of bounds [L, T, R, B] or [T, L , B, R].
 * @returns {bounds?} - intersecting bounds.
 */
function intersectionOfBoundsIllustrator(arrayOfBounds) {

    // sort a copy of array
    var bounds = arrayOfBounds
        .slice()
        .sort(function (a, b) { return b[0] - a[0] || a[1] - b[1] });

    // start with first bounds
    var intersection = bounds.shift(),
        b;

    // compare each bounds, getting smaller
    while (b = bounds.shift()) {

        // if doesn't intersect, bail out
        if (!boundsDoIntersectIllustrator(intersection, b))
            return;

        intersection = [
            Math.max(intersection[0], b[0]),
            Math.min(intersection[1], b[1]),
            Math.min(intersection[2], b[2]),
            Math.max(intersection[3], b[3]),
        ];

    }

    return intersection;

};

/**
 * Returns true if the two bounds intersect.
 * @author m1b
 * @version 2024-03-10
 * @param {Array} bounds1 - bounds array.
 * @param {Array} bounds2 - bounds array.
 * @returns {Boolean}
 */
function boundsDoIntersectIllustrator(bounds1, bounds2) {

    return !(
        bounds2[0] > bounds1[2]
        || bounds2[1] < bounds1[3]
        || bounds2[2] < bounds1[0]
        || bounds2[3] > bounds1[1]
    );

};

/**
 * Returns the rotation amount in degrees
 * that the item needs to be rotated such
 * that it has a minimal bounding box area.
 * Assuming that `item` is a rectangular
 * object, such as a PlacedItem, RasterItem
 * or a rectangular path item, the resulting
 * rotation will rotate it so that the sides
 * of the rectangle align to a factor of 90°.
 * In other words, it will return the value
 * required to "unrotate" a rectangular item.
 * @author m1b
 * @version 2023-08-25
 * @param {PageItem} item - an Illustrator page item.
 * @returns {Number}
 */
function findRotationByMinimalBoundsIllustrator(item) {

    // we will rotate a copy and leave the original
    var workingItem = item.duplicate()

    if ('function' === typeof workingItem.createOutline)
        workingItem = workingItem.createOutline();

    var convergenceThreshold = 0.001,
        inc = 45, // the starting rotation increment
        rotationAmount = 0,
        prevArea = area(workingItem);

    while (Math.abs(inc) >= convergenceThreshold) {

        workingItem.rotate(inc);

        var newArea = area(workingItem);

        if (newArea < prevArea) {
            prevArea = newArea;
            rotationAmount -= inc;
            inc *= 0.5;
        }

        else {
            workingItem.rotate(-inc); // Undo the last rotation
            inc *= -0.5;
        }

    }

    // clean up
    workingItem.remove();

    return round(rotationAmount, 2);

    /**
     * Returns area of bounding box of `item`.
     * @param {PageItem} item
     * @returns {Number}
     */
    function area(item) {
        return item.width * item.height;
    };

};

/**
 * Draws a rectangle to the document.
 * @param {Document|Layer|GroupItem} container - an Illustrator container.
 * @param {Array<Number>} rect - [L, T, W, H]
 * @param {Object} props - properties to assign to the rectangle.
 * @return {PathItem}
 */
function drawRectangleIllustrator(container, rect, properties) {

    properties = properties || {};

    // var rectangle = container.pathItems.rectangle(bounds[1], bounds[0], bounds[2] - bounds[0], -(bounds[3] - bounds[1])); // TLWH
    var rectangle = container.pathItems.rectangle(-rect[1], rect[0], rect[2], rect[3]); // TLWH

    // defaults
    rectangle.filled = true;
    rectangle.stroked = false;

    // apply properties
    for (var key in properties)
        if (properties.hasOwnProperty(key))
            rectangle[key] = properties[key];

    return rectangle;

};


/**
 * Performs an Illustrator undo operation.
 */
IllustratorPackingAdapter.undo = function undo() {
    app.undo();
};

/**
 * Performs a cleanup after the packing is completed.
 */
IllustratorPackingAdapter.cleanup = function cleanup() {
    app.redraw();
};