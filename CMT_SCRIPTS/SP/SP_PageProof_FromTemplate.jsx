//@include '../UTILITIES/Polyfills.js';
//@include '../UTILITIES/Settings.jsx';
//@include '../UTILITIES/Layers.jsx';
//@include '../UTILITIES/Proofs.jsx';
//@include './SP_PageProofCW_FromTemplate.jsx';

function SP_PageProof_FromTemplate() {
  // Set up & load settings
  var settingsFile = setupSettingsFile(
    "CMT_Seps_Settings",
    "Settings_Config.json"
  );
  var settingsData = loadJSONData(settingsFile);

  // Illustrator Coordinate System
  app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;

  // Active Document
  var doc = app.activeDocument;

  // Metadata items
  var metadataLayer = doc.layers.getByName("Metadata");
  var metaGroup = metadataLayer.groupItems.getByName("MetaGroup");
  var metaArtFile = metaGroup.textFrames.getByName("_ART FILE");
  var metaLocation = metaGroup.textFrames.getByName("_LOCATION");

  // Values for order & art file
  var artFile = metaArtFile.textRange.contents;

  // If Art layer try to select, else alert & exit if no selection
  selectArtLayer();

  // Copy art
  app.copy();

  // Open template document
  var proofPageTemplatePath = settingsData.SP_proofTemplatePath;
  app.open(new File(proofPageTemplatePath));

  // Reset active document to proof template
  doc = app.activeDocument;

  // Artboard
  var artboardIndex = doc.artboards.getActiveArtboardIndex();
  var artBoard = doc.artboards[artboardIndex];

  // PROOF layer items
  var proofLayer = doc.layers.getByName("PROOF");
  var shirt = proofLayer.pathItems.getByName("SHIRT");
  var orderNumber = doc.textFrames.getByName("ORDER_NUMBER");
  var artNumber = doc.textFrames.getByName("ART_NUMBER");

  // Make PROOF layer the active layer
  doc.activeLayer = proofLayer;

  // Set order number & art number values
  artNumber.textRange.contents = "ART #: " + artFile;

  // Paste copied art
  app.paste();

  // If selection isn't 1 item or 1 group, create group
  if (doc.selection.length > 1) {
    app.executeMenuCommand("group");
  }

  var pastedArt = doc.selection[0];

  // Call local script to set Overprint Fill to false on art selection
  //@include '../UTILITIES/Overprint_Fill_False.jsx'

  // Rotate art if upside down on template
  if (metaLocation.contents === "UD" || metaLocation.contents === "PK") {
    pastedArt.rotate(180);
  }

  // Resize art to 7.5" wide if over
  if (pastedArt.width > 540) {
    var xScaleBy = (540 / pastedArt.width) * 100;
    pastedArt.resize(xScaleBy, xScaleBy);
  }

  // Resize art to 9.25" high if over
  if (pastedArt.height > 666) {
    var yScaleBy = (666 / pastedArt.height) * 100;
    pastedArt.resize(yScaleBy, yScaleBy);
  }

  // Resize shirt w/ 0.50" margins
  shirt.width = pastedArt.width + 36;
  shirt.height = pastedArt.height + 36;

  // Center art & shirt on artboard
  centerOnArtboard(pastedArt, artBoard);
  centerOnArtboard(shirt, artBoard);

  // Position art & shirt if overlap into header
  toTallPosition(pastedArt, shirt);

  // Deselect everything
  doc.selection = false;

  // Change White swatches to pure white
  toProofWhite();

  // Input for Order / Art # / Due Date
  //@include './SP_PageProof_OrderArtDuePrompt.jsx';
}

// Run
try {
  if (
    app.documents.length > 0 &&
    app.activeDocument.artboards[0].name === "SP_Template"
  ) {
    cwLayersExist()
      ? SP_PageProofCW_FromTemplate()
      : SP_PageProof_FromTemplate();
  } else {
    throw new Error("SP Template File Not Active");
  }
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
}
