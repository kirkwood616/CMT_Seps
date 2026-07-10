/**
 * Creates a 1x1 inch artboard 1 inch to the right from active artboard.
 * @returns {Artboard}
 */
function addInchArtboard() {
  // Active Document
  var thisDoc = app.activeDocument;

  // Illustrator Coordinate System
  app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;
  // Artboard Index
  var artboardIndex = thisDoc.artboards.getActiveArtboardIndex();
  // Artboard rectangle bounding coordinates array
  var artboardBounds = thisDoc.artboards[artboardIndex].artboardRect;

  return thisDoc.artboards.add([
    artboardBounds[2] + 72,
    artboardBounds[1],
    artboardBounds[2] + 144,
    artboardBounds[1] - 72,
  ]);
}
