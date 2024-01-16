function RTF_Generate_ArtLayout() {
  // Illustrator Coordinate System
  app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;

  // Active Document
  var doc = app.activeDocument;

  // Transfer Art Layer
  var artLayer = doc.layers.getByName("Transfer Art");

  // Artboard Index
  var artboardIndex = doc.artboards.getActiveArtboardIndex();

  // Artboard rectangle bounding coordinates array
  var artboardBounds = doc.artboards[artboardIndex].artboardRect;

  // Max image area (15" W x 20.5" H)
  var maxArtBounds = [1080, 1476];

  // Deselect everything
  doc.selection = false;

  // Select Transfer Art
  artLayer.hasSelectedArtwork = true;

  // Current selection
  var sel = doc.selection[0];

  // Calculate & generate layout
  makeArtLayout(sel, maxArtBounds);

  // Group generated layout
  artLayer.hasSelectedArtwork = true;
  app.executeMenuCommand("group");

  // Center grouped layout
  sel = doc.selection[0];
  centerOnArtboard(sel, artboardBounds);

  // Deselect everything
  doc.selection = false;
}

// Run
try {
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "RTF_Template") {
    RTF_Generate_ArtLayout();
  } else {
    throw new Error("RTF Template File Not Active");
  }
} catch (e) {
  alert(e, "Script Alert", true);
}

//*******************
// Helper functions
//*******************

function makeArtLayout(obj, maxBounds) {
  // Object dimensions
  var objWidth = Math.floor(obj.width);
  var objHeight = Math.floor(obj.height);

  // Max image area dimensions
  var maxWidth = maxBounds[0];
  var maxHeight = maxBounds[1];

  // Number of copies
  var rotatedCopies = Math.floor(maxWidth / objHeight); // # of rotated fit horizontally (X)
  var rotatedVerticalCopies = Math.floor(maxHeight / objWidth); // # of rotated fit vertically (Y)
  var verticalCopies = Math.floor(maxHeight / objHeight); // # of copies fit vertically (Y)

  // 0.50" margin between each copy except 1
  var widthMargin = 36 * (rotatedCopies - 1);
  var heightMargin = 36 * (verticalCopies - 1);

  // Reset copies, accounting for margin & rotation stacking (720 === max stack height)
  rotatedCopies =
    objWidth > 720
      ? Math.floor((maxWidth - widthMargin) / objHeight)
      : Math.floor((maxWidth - widthMargin) / objHeight) * rotatedVerticalCopies;
  verticalCopies = Math.floor((maxHeight - heightMargin) / objHeight);

  // DUPLICATE VERTICALLY (Y)
  if (rotatedCopies < verticalCopies || rotatedCopies === verticalCopies) {
    for (var i = 1; i < verticalCopies; i++) {
      var objHeightWithMargin = obj.height + 36;
      obj.duplicate().translate(0, objHeightWithMargin * i);
    }
  }

  // ROTATE & DUPLICATE
  if (rotatedCopies > verticalCopies) {
    // Rotate
    obj.rotate(90);

    // Duplicate horizontally (X)
    for (var i = 1; i < rotatedCopies / rotatedVerticalCopies; i++) {
      var objMarginWidth = obj.width + 36;
      var objCopyX = obj.duplicate();
      objCopyX.translate(objMarginWidth * i, 0);
    }

    // Duplicate vertically (Y)
    for (var j = 1; j < rotatedVerticalCopies; j++) {
      var objMarginHeight = obj.height + 36;
      var objCopyY = obj.duplicate();
      objCopyY.translate(0, objMarginHeight * j);

      // Duplicate horizontally (X)
      for (var k = 1; k < rotatedCopies / rotatedVerticalCopies; k++) {
        objCopyY.duplicate().translate(objMarginWidth * k, 0);
      }
    }
  }
}

function centerOnArtboard(obj, bounds) {
  var objPosition = new Array((bounds[2] - bounds[0]) / 2 - obj.width / 2, (bounds[3] - bounds[1]) / 2 + obj.height / 2);

  obj.position = objPosition;
}
