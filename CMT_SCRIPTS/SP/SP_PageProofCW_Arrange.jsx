//@include '../UTILITIES/Layers.jsx';

function SP_PageProofCW_Arrange() {
  // Illustrator Coordinate System
  app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;

  // Active Document
  var doc = app.activeDocument;
  // Layers in document
  var docLayers = doc.layers;
  // Artboard Index
  var artboardIndex = doc.artboards.getActiveArtboardIndex();
  // Artboard rectangle bounding coordinates array
  var artboardBounds = doc.artboards[artboardIndex].artboardRect;

  // Deselect everything
  doc.selection = null;

  // CW_ layer ref
  var countCW = 0;
  var cwImageDimensions;

  for (var i = 0; i < docLayers.length; i++) {
    if (docLayers[i].name.indexOf("CW_") < 0) continue;
    countCW++;
  }

  // All CW_ layers visible & 1 group in each layer
  for (var i = 0; i < docLayers.length; i++) {
    if (docLayers[i].name.indexOf("CW_") < 0) continue;
    if (!docLayers[i].visible) docLayers[i].visible = true;

    docLayers[i].hasSelectedArtwork = true;

    if (doc.selection.length > 1) {
      app.executeMenuCommand("group");
    }

    docLayers[i].hasSelectedArtwork = false;
  }

  // Deselect everything
  doc.selection = null;

  // Resize if too tall
  for (var i = 0; i < docLayers.length; i++) {
    if (docLayers[i].name.indexOf("CW_") < 0) continue;

    var thisLayerArt = docLayers[i].pageItems[0];

    if (thisLayerArt.height > 696) {
      var yScaleBy = (696 / thisLayerArt.height) * 100;
      thisLayerArt.resize(yScaleBy, yScaleBy);
    }
  }

  // Store dimensions of CW_ group
  var cw1 = docLayers.getByName("CW_1");

  cwImageDimensions = new Array(
    cw1.pageItems[0].width,
    cw1.pageItems[0].height
  );

  // Max image area (7.9722" W x 9.6944" H)
  var maxArtBounds = [576, 698];

  // Margin between copies
  var margin = 18;

  // Vertical start position in document
  var startVerticalPos = -75.867860954213;

  // Copies possible to fit in maxArtBounds w/ half margin added
  var horizontalCopies = Math.floor(
    maxArtBounds[0] / (cwImageDimensions[0] + margin / 2)
  );
  var verticalCopies = Math.floor(
    maxArtBounds[1] / (cwImageDimensions[1] + margin / 2)
  );

  if (horizontalCopies === 0) horizontalCopies = 1;
  if (verticalCopies === 0) verticalCopies = 1;

  // Horizontal dimensions & positions
  var marginsHorizontal = (margin / 2) * horizontalCopies;
  var baseImageWidth = cwImageDimensions[0] * horizontalCopies;
  var totalImageWidth = baseImageWidth + marginsHorizontal;
  var centeredStartPosition =
    (artboardBounds[2] - artboardBounds[0]) / 2 - totalImageWidth / 2;

  // Store if arrangement is in a grid
  var isGrid = false;

  // Arrange in grid if possible
  if (horizontalCopies > 1) {
    // Update arrangement
    isGrid = true;

    // Start positions
    var positionStartX = centeredStartPosition;
    var positionStartY = startVerticalPos;
    // Counters
    var counterY = 1;
    var counterX = 1;

    // Arrange each layer
    for (var i = 0; i < docLayers.length; i++) {
      if (docLayers[i].name.indexOf("CW_") < 0) continue;

      // Layer positioning
      var thisCW = docLayers[i].pageItems[0];
      thisCW.position = [positionStartX, positionStartY];

      // Update next position
      positionStartX = positionStartX + thisCW.width + margin;

      // Set new start positions if at max horizontal
      if (counterX === horizontalCopies) {
        positionStartX = centeredStartPosition;
        positionStartY = positionStartY - thisCW.height - margin;
        counterX = 1;
        counterY++;
      } else {
        counterX++;
      }

      // Set new vertical position if at max
      if (counterY === verticalCopies + 1) {
        positionStartY = startVerticalPos;
        counterY = 1;
      }
    }
  }

  // Arrange vertically if grid not possible
  if (verticalCopies > 1 && horizontalCopies < 2) {
    // Start positions
    var startPositionY = startVerticalPos;
    // Counters
    var verticalCounter = 1;

    // Arrange each layer
    for (var i = 0; i < docLayers.length; i++) {
      if (docLayers[i].name.indexOf("CW_") < 0) continue;

      // Layer positioning
      var currCW = docLayers[i].pageItems[0];
      var xPosCurrCW = currCW.position[0];
      currCW.position = [xPosCurrCW, startPositionY];

      // Update next position
      startPositionY = startPositionY - currCW.height - margin;

      // Set new start position if at max vertical
      if (verticalCounter === verticalCopies) {
        startPositionY = startVerticalPos;
        verticalCounter = 1;
      } else {
        verticalCounter++;
      }
    }
  }

  // Ungroup & Hide non-CW_1 layers
  for (var i = 0; i < docLayers.length; i++) {
    if (docLayers[i].name.indexOf("CW_") < 0) continue;

    // Ungroup
    docLayers[i].hasSelectedArtwork = true;
    app.executeMenuCommand("ungroup");
    docLayers[i].hasSelectedArtwork = false;

    // GRID: Not visible if over vertical limit
    if (isGrid && i + 1 > horizontalCopies * verticalCopies) {
      docLayers[i].visible = false;
    }

    // NON-GRID: Not visible if over vertical limit
    if (!isGrid && i + 1 > verticalCopies) {
      docLayers[i].visible = false;
    }
  }
}

SP_PageProofCW_Arrange();
