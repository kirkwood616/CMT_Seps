/**
 * @file Pack Selected Items Into Artboards.js
 *
 * FOR ADOBE ILLUSTRATOR
 *
 * @author m1b
 * @version 2025-06-01
 */
//@include './Lib/IllustratorPackingAdapter.js'
//@include './Lib/PackItems.js'
//@include './Lib/TrentiumsPacker.js'
//@include './Lib/Block.js'
//@include './Lib/Bin.js'
//@include './Lib/BinPacking.js'
//@include './Lib/PackingAttempt.js'
//@include './Lib/BinarySearchRange.js'
(function () {
  if (app.name.toLowerCase().indexOf("illustrator") < 0) return alert("This script is for Adobe Illustrator.");

  if (0 === app.documents.length || 0 === app.activeDocument.selection.length)
    return alert("Please select some items and try again.");

  var doc = app.activeDocument,
    items = doc.selection;

  var packingOptions = new PackingOptions({
    /** the document */
    doc: doc,

    /** the page items to pack (can be groupItems) */
    items: items,

    /** which packing adapter to use: Illustrator or Indesign */
    packingAdapter: IllustratorPackingAdapter,

    /** the space between items, in pts, or can use 'mm' or 'inch' */
    padding: "0.5inch",

    /** space around edges of artboards, in pts, or can use 'mm' or 'inch' */
    margin: "0inch",

    /** is it okay to rotate 90 degrees? */
    allow90DegreeRotation: true,

    /**
     * whether to allow rotation by any amount
     * if so, items will be first rotated to fit best into a rectangle
     * in practice this may cause rotation between 0 and 90°
     */
    allowAnyRotation: false,

    /**
     * progressive packing will generally give a more dense
     * rectangular packing _inside_ a bin, but will take longer
     */
    doProgressivePacking: true,

    /** which packing operations to perform */
    packingOperation: PackingOperation.BASIC_SORTS_PLUS_RANDOM_PACKING,

    /** the orientation of the packing, row or column, left to right, top to bottom */
    packingOrientation: PackingOrientation.ROW_TOP_LEFT,

    /**
     * should we stop on first successful packing, or keep trying to improve?
     * when this is on, the packing will always make `maxAttemptCount` attempts.
     */
    stopAtFirstSuccess: false,

    /** shows the UI options */
    showUI: true,

    /** show results after packing */
    showResults: true,
  });

  // make the bins
  for (var i = 0; i < doc.artboards.length; i++)
    packingOptions.bins.push(
      IllustratorPackingAdapter.makeBinFromArtboard(doc.artboards[i], packingOptions.marginPts, packingOptions.paddingPts),
    );

  // do the packing
  packItems(packingOptions);
})();
