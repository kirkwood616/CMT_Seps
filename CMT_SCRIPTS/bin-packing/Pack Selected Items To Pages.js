/**
 * @file Pack Selected Items Into Pages.js
 *
 * FOR ADOBE INDESIGN
 *
 * Usage:
 *   1. Select the page items to pack.
 *   2. Run this script.
 *
 * Will attempt to pack the items into the
 * available pages of the active document.
 *
 * @author m1b
 * @version 2025-07-24
 */
function main() {

    //@include './Lib/IndesignPackingAdapter.js'
    //@include './Lib/PackItems.js'
    //@include './Lib/TrentiumsPacker.js'
    //@include './Lib/Block.js'
    //@include './Lib/Bin.js'
    //@include './Lib/BinPacking.js'
    //@include './Lib/PackingAttempt.js'
    //@include './Lib/BinarySearchRange.js'

    if (app.name.toLowerCase().indexOf('indesign') < 0)
        return alert('This script is for Adobe Indesign.');

    if (
        0 === app.documents.length
        || 0 === app.activeDocument.selection.length
    )
        return alert('Please select some items and try again.');

    var doc = app.activeDocument,
        items = doc.selection;

    var packingOptions = new PackingOptions({

        /** the document */
        doc: doc,

        /** the page items to pack (can be groupItems) */
        items: items,

        /** which packing adapter to use: Illustrator or Indesign */
        packingAdapter: IndesignPackingAdapter,

        /** the space between items, in pts, or can use 'mm' or 'inch' */
        padding: '1mm',

        /** space around edges of artboards, in pts, or can use 'mm' or 'inch' */
        margin: '2mm',

        /** is it okay to rotate 90 degrees? */
        allow90DegreeRotation: true,

        /**
         * whether to allow rotation by any amount
         * if so, items will be first rotated to fit best into a rectangle
         * in practice this may cause rotation between 0 and 90°
         */
        allowAnyRotation: true,

        /**
         * progressive packing will generally give a more dense
         * rectangular packing _inside_ a bin, but will take longer
         */
        doProgressivePacking: true,

        /** the maximum number of attempts to make */
        maxAttemptCount: undefined,

        /** which packing operations to perform */
        packingOperation: PackingOperation.BASIC_SORTS_PLUS_RANDOM_PACKING,

        /** the orientation of the packing; will pack in rows, oriented to a corner */
        packingOrientation: PackingOrientation.ROW_TOP_RIGHT,

        /**
         * should we stop on first successful packing, or keep trying to improve?
         * when this is on, the packing will always make `maxAttemptCount` attempts.
         */
        stopAtFirstSuccess: false,

        /** shows the UI options */
        showUI: true,

        /** show results after packing */
        showResults: false,

    });

    /* ----------------------------------- *
     *  Custom Indesign-specific options   *
     * ----------------------------------- */
    var indesignSettings = {
        /** whether packing should consider guides as dividers */
        useGuidesToDivideBins: false,
        /** the margin on either side of a guide, if used for dividing */
        guidesMargin: getUnitStringAsPoints('2 mm'),
    };

    // debugging:
    // packingOptions.showBlockBounds = true;
    // packingOptions.moveItems = false;

    app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;

    /* ----------------- *
     *  Make the bins    *
     * ----------------- */
    for (var i = 0, page, margins; i < doc.pages.length; i++) {

        page = doc.pages[i];
        margins = packingOptions.margin;

        if (indesignSettings.useGuidesToDivideBins)
            // special operation to create bins by dividing page at guides
            // so a page with a single horizontal guide will make 2 bins and
            // a page with a horizontal and a veritcal guide will make 4 bins
            packingOptions.bins = packingOptions.bins.concat(IndesignPackingAdapter.makeBinsFromPageDividedByGuides(page, margins, packingOptions.padding, indesignSettings.guidesMargin));

        else
            // make a single bin
            packingOptions.bins.push(IndesignPackingAdapter.makeBinFromPage(page, margins, packingOptions.paddingPts));

    }

    /* ----------------- *
     *  Do the packing   *
     * ----------------- */

    packItems(packingOptions);

};
app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, 'Pack Items');