function SP_PageProof_Note() {
  // Active Document
  var doc = app.activeDocument;

  // Artboard
  app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;
  var artboardIndex = doc.artboards.getActiveArtboardIndex();
  var artboardBounds = doc.artboards[artboardIndex].artboardRect;

  // Swatches
  var redNote = doc.swatches.getByName("RED_NOTE").color;

  // Layers
  var activeLayer = doc.activeLayer;
  var proofLayer = doc.layers.getByName("PROOF");

  // Proof Layer text
  var artNumber = proofLayer.textFrames.getByName("ART_NUMBER");

  // Font data
  var font = artNumber.textRange.characterAttributes.textFont;
  var fontSize = 21;

  // Note
  var newNote = activeLayer.textFrames.add();
  newNote.textRange.characterAttributes.textFont = font;
  newNote.textRange.contents = "** PRINT/FLASH/PRINT **";
  newNote.textRange.characterAttributes.size = fontSize;
  newNote.textRange.characterAttributes.fillColor = redNote;
  newNote.paragraphs[0].justification = Justification.CENTER;

  // Position center + 1 inch downß
  newNote.position = new Array((artboardBounds[2] - artboardBounds[0]) / 2 - newNote.width / 2, -72);
}

// Run
try {
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "PAGE_PROOF") {
    SP_PageProof_Note();
  } else {
    throw new Error("PAGE_PROOF Template Not Active");
  }
} catch (e) {
  alert(e, "Script Alert", true);
}
