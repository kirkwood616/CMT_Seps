/**
 * @file IndesignPackingAdapter.js
 *
 * The IndesignPackingAdapter provides an interface to convert between
 * Indesign page items and the packing blocks used by the packing algorithm,
 * as well as creating packing Bins from Indesign Pages.
 */

function IndesignPackingAdapter() { };

/**
 * Prepares Indesign for packing.
 * @author m1b
 * @version 2025-06-27
 */
IndesignPackingAdapter.init = function (doc) {

    app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;
    app.scriptPreferences.enableRedraw = false;
    IndesignPackingAdapter.doc = doc;

};

/**
 * Initializes the block for this packing adapter.
 * @author m1b
 * @version 2025-06-29
 * @param {Block} block - the block to initialize.
 * @param {Function} [initializer] - a function that takes the new block as parameter (default: none).
 */
IndesignPackingAdapter.initializeBlock = function (block, initializer) {

    if ('function' === typeof initializer)
        initializer(block);

    // get a more accurate bounds
    block.visibleBounds = block.item.visibleBounds;
    block.improvedBounds = getItemBoundsIndesign(block.item, false);

    block.w = block.improvedBounds[3] - block.improvedBounds[1] + block.padding;
    block.h = block.improvedBounds[2] - block.improvedBounds[0] + block.padding;

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
 * @param {Object} packingItem - the packing item object.
 * @param {Bin} bin - the item's packing bin.
 * @param {PackingOptions} options - the packing options.
 */
IndesignPackingAdapter.positionItem = function (block, bin, options) {

    var item = block.item,
        page = bin.referenceItem;

    if ('Page' !== page.constructor.name)
        page = options.doc.layoutWindows.activePage;

    var x0 = bin.x0 + block.x0,
        y0 = bin.y0 + block.y0,
        x1 = bin.x0 + block.x0 + block.w - bin.padding,
        y1 = bin.y0 + block.y0 + block.h - bin.padding;

    if (options.showBlockBounds) {

        drawRectangleIndesign(page, [y0, x0, y1, x1], {
            stroked: true,
            strokeWidth: 0.5,
            name: item.name ? 'block "' + item.name + '"' : '',
        });

    }

    if (
        options.moveItems
        && item.parentPage !== page
    )
        // put on the bin's page
        item.move(page);

    // the offset between the visible bounds and the improved bounds
    var dx, dy, tx, ty;

    if (block.isRotated) {
        // rotate 90° counterclockwise
        item.transform(
            CoordinateSpaces.pasteboardCoordinates,
            AnchorPoint.CENTER_ANCHOR,
            app.transformationMatrices.add({ counterclockwiseRotationAngle: 90 })
        );
        dx = -(block.improvedBounds[0] - block.visibleBounds[0]);
        dy = block.improvedBounds[3] - block.visibleBounds[3];
        tx = (x0 - item.visibleBounds[1]) + dx;
        ty = (y0 - item.visibleBounds[0]) + dy;
    }
    else {
        dx = block.visibleBounds[1] - block.improvedBounds[1];
        dy = block.visibleBounds[0] - block.improvedBounds[0];
        tx = (x0 - item.visibleBounds[1]) + dx;
        ty = (y0 - item.visibleBounds[0]) + dy;
    }

    if (!options.moveItems)
        return;

    // position the item
    item.transform(
        CoordinateSpaces.pasteboardCoordinates,
        AnchorPoint.TOP_LEFT_ANCHOR,
        app.transformationMatrices.add({ horizontalTranslation: tx, verticalTranslation: ty })
    );

};

/**
 * Returns a Bin based on the given Indesign Page.
 * @param {Page} page - an Indesign Page.
 * @param {Number} margin - the margin to leave around the artboard.
 * @param {Number} padding - the padding to leave around blocks when packing this bin.
 * @returns {Bin}
 */
IndesignPackingAdapter.makeBinFromPage = function (page, margin, padding) {

    if ('number' === typeof margin)
        margin = [margin, margin, margin, margin];

    return new Bin({
        x0: page.bounds[1],
        y0: page.bounds[0],
        x1: page.bounds[3],
        y1: page.bounds[2],
        margin: margin,
        padding: padding,
        referenceItem: page,
    });


};

/**
 * Returns an array of Bins, using guides to divide
 * the given Indesign Page into multiple bins.
 * @param {Page} page - an Indesign Page.
 * @param {Number} margin - the margin to leave around the artboard.
 * @param {Number} padding - the padding to leave around blocks when packing this bin.
 * @param {Number} guidesMargin - the space to leave on either side of each guide.
 * @returns {Array<Bin>}
 */
IndesignPackingAdapter.makeBinsFromPageDividedByGuides = function (page, margin, padding, guidesMargin) {

    var bins = [];

    if ('number' === typeof margin)
        margin = [margin, margin, margin, margin];

    var x0 = page.bounds[1] + margin[0],
        y0 = page.bounds[0] + margin[1],
        x1 = page.bounds[3] - margin[2],
        y1 = page.bounds[2] - margin[3];

    // divide up with guides
    var guides = page.guides.everyItem().getElements();
    var pageBinsBounds = divideBounds([y0, x0, y1, x1], guides, guidesMargin);

    for (var j = 0, binBounds; j < pageBinsBounds.length; j++) {

        binBounds = pageBinsBounds[j];

        bins.push(
            new Bin({
                x0: binBounds[1],
                y0: binBounds[0],
                x1: binBounds[3],
                y1: binBounds[2],
                margin: margin,
                padding: padding,
                referenceItem: page,
            })
        );

    }

    return bins;

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
IndesignPackingAdapter.rotateItemToFitSmallestRectangle = function (block) {

    if (Math.abs(block.w - block.h) < 1)
        // no point rotating a square
        return;

    var item = block.item,
        angle = findRotationByMinimalBoundsIndesign(item);

    if (Math.abs(angle % 90) < 1)
        // don't bother with tiny rotations
        return;

    item.transform(
        CoordinateSpaces.pasteboardCoordinates,
        AnchorPoint.CENTER_ANCHOR,
        app.transformationMatrices.add({ counterclockwiseRotationAngle: - angle }),
    );

};

/**
 * Returns bounds of item(s) for Indesign.
 * Note: just a quick conversion of my Illustrator function,
 * so probably doesn't cover many edge cases.
 * @author m1b
 * @version 2024-09-07
 * @param {PageItem|Array<PageItem>} item - an Indesign PageItem or array of PageItems.
 * @param {Boolean} [geometric] - if false, returns visible bounds.
 * @param {Array} [bounds] - private parameter, used when recursing.
 * @returns {Array} - the calculated bounds.
 */
function getItemBoundsIndesign(item, geometric, bounds) {

    var newBounds = [],
        boundsKey = geometric ? 'geometricBounds' : 'visibleBounds';

    if (undefined == item)
        return;

    if (
        'Group' === item.constructor.name
        || 'Array' === item.constructor.name
    ) {

        var children = 'Group' === item.constructor.name ? item.pageItems : item,
            contentBounds = [];

        for (var i = 0; i < children.length; i++)
            contentBounds.push(getItemBoundsIndesign(children[i], geometric, bounds));

        newBounds = combineBoundsIndesign(contentBounds);

    }

    else if (
        'TextFrame' === item.constructor.name
        && (
            // frame has no fill
            !item.fillColor.hasOwnProperty('model')
            && (
                // frame has no stroke
                !item.strokeColor.hasOwnProperty('model')
                || 0 === item.strokeWeight
            )
        )
    ) {

        // get bounds of outlined text
        var dup = item.duplicate().createOutlines()[0];
        newBounds = dup[boundsKey];
        dup.remove();

    }

    else if (item.hasOwnProperty(boundsKey)) {

        newBounds = item[boundsKey];

    }

    // `bounds` will exist if this is a recursive execution
    bounds = (undefined == bounds)
        ? bounds = newBounds
        : bounds = combineBoundsIndesign([newBounds, bounds]);

    return bounds;

};

/**
 * Returns the combined bounds of all bounds supplied.
 * @author m1b
 * @version 2024-03-09
 * @param {Array<bounds>} boundsArray - an array of bounds [L, T, R, B] or [T, L , B, R].
 * @returns {bounds?} - the combined bounds.
 */
function combineBoundsIndesign(boundsArray) {

    var combinedBounds = boundsArray[0].slice();

    // iterate through the rest of the bounds
    for (var i = 1, b; i < boundsArray.length; i++) {

        b = boundsArray[i];

        combinedBounds = [
            Math.min(combinedBounds[0], b[0]),
            Math.min(combinedBounds[1], b[1]),
            Math.max(combinedBounds[2], b[2]),
            Math.max(combinedBounds[3], b[3]),
        ];

    }

    return combinedBounds;

};

// /**
//  * Returns the overlapping rectangle of two or more rectangles.
//  * NOTE: Returns undefined if ANY rectangles do not intersect.
//  * @author m1b
//  * @version 2024-09-05
//  * @param {Array<bounds>} arrayOfBounds - an array of bounds [T, L , B, R].
//  * @returns {bounds?} - intersecting bounds.
//  */
// function intersectionOfBoundsIndesign(arrayOfBounds) {

//     // sort a copy of array
//     var bounds = arrayOfBounds
//         .slice()
//         .sort(function (a, b) { return b[0] - a[0] || a[1] - b[1] });

//     // start with first bounds
//     var intersection = bounds.shift(),
//         b;

//     // compare each bounds, getting smaller
//     while (b = bounds.shift()) {

//         // if doesn't intersect, bail out
//         if (!boundsDoIntersectIndesign(intersection, b))
//             return;

//         intersection = [
//             Math.max(intersection[0], b[0]),
//             Math.max(intersection[1], b[1]),
//             Math.min(intersection[2], b[2]),
//             Math.min(intersection[3], b[3]),
//         ];

//     }

//     return intersection;

// };

/**
 * Returns true if the two bounds intersect.
 * @author m1b
 * @version 2024-03-10
 * @param {Array} bounds1 - bounds array (T, L, B, R).
 * @param {Array} bounds2 - bounds array (T, L, B, R).
 * @returns {Boolean}
 */
function boundsDoIntersectIndesign(bounds1, bounds2) {

    return !(
        bounds2[0] > bounds1[2]
        || bounds2[1] > bounds1[3]
        || bounds2[2] < bounds1[0]
        || bounds2[3] < bounds1[1]
    );

};


/**
 * Draws and returns a Rectangle.
 * @author m1b
 * @version 2023-08-24
 * @param {Document|Layer|Group} container - the container for the rectangle.
 * @param {Array<Number>} bounds - rectangle bounds [T,L,B,R].
 * @returns {Rectangle}
 */
function drawRectangleIndesign(container, bounds, props) {

    var rectangle = container.rectangles.add({
        geometricBounds: bounds,
    });

    if (props)
        rectangle.properties = props;

    return rectangle;

};

/**
 * Returns an array of bounds, formed by dividing `bounds`
 * using guides as dividers with `margin` on either side
 * of each guide.
 * @author m1b
 * @version 2024-10-13
 * @param {Array<Number>} bounds - the bounds to divide [T,L,B,R].
 * @param {Array<Guide>} guides - the guides to divide with.
 * @param {Number} [margin] - the margin on either side of a guide (default: 0).
 * @returns {bounds} - [T,L,B,R]
 */
function divideBounds(bounds, guides, margin) {

    margin = margin || 0;

    var dividedBounds = [bounds.slice()];

    // sort guides
    guides.sort(function (a, b) { return b.location - a.location });

    // separate horizontal from vertical guides
    var horizontalGuides = [];
    var verticalGuides = [];

    for (var i = 0; i < guides.length; i++) {

        if (HorizontalOrVertical.HORIZONTAL === guides[i].orientation)
            horizontalGuides.push(guides[i]);

        else if (HorizontalOrVertical.VERTICAL === guides[i].orientation)
            verticalGuides.push(guides[i]);

    }

    // divide by horizontal guides (split vertically)
    dividedBounds = divideByGuides(dividedBounds, horizontalGuides, true);

    // Divide by vertical guides (split horizontally)
    dividedBounds = divideByGuides(dividedBounds, verticalGuides, false);

    return dividedBounds;

    /**
     * Helper function: splits each bounds in `boundsArray` by guides in `guides` array.
     * @author m1b
     * @version 2024-10-13
     * @param {Array<bounds>} boundsArray - array of bounds to divide [ [T,L,B,R], [T,L,B,R], ... ].
     * @param {Array<Guide>} guides - the guides to divide with.
     * @param {Boolean} isHorizontal - orientation of the guides (do not mix orientations!)
     * @returns {Array<bounds>}
     */
    function divideByGuides(boundsArray, guides, isHorizontal) {

        guidesLoop:
        for (var i = 0; i < guides.length; i++) {

            var guideLocation = guides[i].location,
                newBounds = [];

            boundsLoop:
            for (var j = 0; j < boundsArray.length; j++) {

                var currentBounds = boundsArray[j],
                    top = currentBounds[0],
                    left = currentBounds[1],
                    bottom = currentBounds[2],
                    right = currentBounds[3];

                if (isHorizontal) {

                    // horizontal guide, split vertically
                    if (top < guideLocation && bottom > guideLocation) {
                        newBounds.push([top, left, guideLocation - margin, right]);
                        newBounds.push([guideLocation + margin, left, bottom, right]);
                    }

                    else {
                        // no split needed, just add the bounds as is
                        newBounds.push(currentBounds);
                    }

                }

                else {

                    // vertical guide, split horizontally
                    if (left < guideLocation && right > guideLocation) {
                        newBounds.push([top, left, bottom, guideLocation - margin]);
                        newBounds.push([top, guideLocation + margin, bottom, right]);
                    }

                    else {
                        // no split needed, just add the bounds as is
                        newBounds.push(currentBounds);
                    }

                }

            }

            // update boundsArray with the new sections created at this guide
            boundsArray = newBounds;

        }

        return boundsArray;

    };

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
 * required to "unrotate" the item.
 * @author m1b
 * @version 2024-10-22
 * @param {PageItem} item - an Indesign page item.
 * @returns {Number}
 */
function findRotationByMinimalBoundsIndesign(item) {

    app.scriptPreferences.enableRedraw = false;

    // we will rotate a copy and leave the original
    var workingItem = item.duplicate()

    if ('function' === typeof workingItem.createOutlines)
        workingItem = workingItem.createOutlines()[0];

    var convergenceThreshold = 0.001,
        inc = 45, // the starting rotation increment
        rotationAmount = 0,
        prevArea = area(workingItem);

    while (Math.abs(inc) >= convergenceThreshold) {

        rotate(workingItem, inc);

        var newArea = area(workingItem);

        if (newArea < prevArea) {
            prevArea = newArea;
            rotationAmount -= inc;
            inc *= 0.5;
        }

        else {
            // undo the last rotation
            rotate(workingItem, -inc);
            inc *= -0.5;
        }

    }

    // clean up
    workingItem.remove();

    return round(rotationAmount, 3);

    /**
     * Returns area of bounding box of `item`.
     * @param {PageItem} item
     * @returns {Number}
     */
    function area(item) {
        var b = item.visibleBounds;
        return (b[3] - b[1]) * (b[2] - b[0]);
    };

    /**
     * Rotates `item` by `angle`.
     * @param {PageItem} item - the item to rotate.
     * @param {Number} angle - angle in degrees.
     */
    function rotate(item, angle) {
        item.transform(
            CoordinateSpaces.pasteboardCoordinates,
            AnchorPoint.CENTER_ANCHOR,
            app.transformationMatrices.add({ counterclockwiseRotationAngle: angle }),
        );
    };

};

/**
 * Performs a cleanup after the packing is completed.
 */
IndesignPackingAdapter.cleanup = function cleanup() {
    app.scriptPreferences.enableRedraw = true;
};