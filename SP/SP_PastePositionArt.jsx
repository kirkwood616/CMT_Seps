function SP_PastePositionArt() {
  // Illustrator Coordinate System
  app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;

  // Active Document
  var doc = app.activeDocument;

  // Registration
  var regLayer = doc.layers.getByName("Registration");
  var regBottomCenter = regLayer.groupItems.getByName("REG_BOTTOM_CENTER");

  // Transfer Art Layer
  var artLayer = doc.layers.getByName("Art");

  // Artboard Index
  var artboardIndex = doc.artboards.getActiveArtboardIndex();

  // Artboard rectangle bounding coordinates array
  var artboardBounds = doc.artboards[artboardIndex].artboardRect;

  // Centered X position on artboard
  var regCenteredPosition = 553.22509765623;

  // Deselect everything
  doc.selection = false;

  // Set Active Layer to Transfer Art Layer
  doc.activeLayer = artLayer;

  // Paste & group art
  app.paste();
  app.executeMenuCommand("group");

  // Selected pasted art
  var pastedArt = doc.selection[0];

  // Position art horizontally centered and 2 inches from top of artboard
  pastedArt.position = new Array((artboardBounds[2] - artboardBounds[0]) / 2 - pastedArt.width / 2, -144);

  // Store height of art
  var artHeight = pastedArt.height;

  // Move registration mark 0.50" down from bottom of art
  regBottomCenter.position = [regCenteredPosition, artHeight * -1 + -180];
}

// Run
try {
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "SP_Template") {
    SP_PastePositionArt();
  } else {
    throw new Error("SP Template File Not Active");
  }
} catch (e) {
  alert(e, "Script Alert", true);
}
