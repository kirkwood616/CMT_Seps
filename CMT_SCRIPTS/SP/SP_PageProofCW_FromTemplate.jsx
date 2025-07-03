//@include '../UTILITIES/Settings.jsx';
//@include '../UTILITIES/Layers.jsx';
//@include '../UTILITIES/Proofs.jsx';
//@include '../UTILITIES/Polyfills.js';

function SP_PageProofCW_FromTemplate() {
  // Set up & load settings
  var settingsFile = setupSettingsFile(
    "CMT_Seps_Settings",
    "Settings_Config.json"
  );
  var settingsData = loadJSONData(settingsFile);

  // Illustrator Coordinate System
  app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;

  // Art Document
  var artDoc = app.activeDocument;

  // Deselect everything
  artDoc.selection = null;

  // Metadata items
  var metaGroup = artDoc.groupItems.getByName("MetaGroup");
  var metaArtFile = metaGroup.textFrames.getByName("_ART FILE");
  var metaLocation = metaGroup.textFrames.getByName("_LOCATION");

  // Values for order & art file
  var artFile = metaArtFile.textRange.contents;

  // Exit if no CW_ layers
  if (!cwLayersExist()) throw new Error("No CW_ Layers");

  var cwLayers = new Array();

  for (var i = 0; i < artDoc.layers.length; i++) {
    if (artDoc.layers[i].name.indexOf("CW_") > -1)
      cwLayers.push(artDoc.layers[i].name);
  }

  // Open template document
  var proofPageTemplatePath = settingsData.SP_proofTemplatePath;
  app.open(new File(proofPageTemplatePath));

  // Proof Document
  var proofDoc = app.activeDocument;

  // Artboard
  var artboardIndex = proofDoc.artboards.getActiveArtboardIndex();
  var artBoard = proofDoc.artboards[artboardIndex];

  // PROOF layer items
  var proofLayer = proofDoc.layers.getByName("PROOF");
  var shirt = proofLayer.pathItems.getByName("SHIRT");
  var orderNumber = proofDoc.textFrames.getByName("ORDER_NUMBER");
  var artNumber = proofDoc.textFrames.getByName("ART_NUMBER");

  // Make PROOF layer the active layer
  proofDoc.activeLayer = proofLayer;

  // Set order number & art number values
  artNumber.textRange.contents = "ART #: " + artFile;

  // Add CW_ layers to Proof Document
  for (var i = 0; i < cwLayers.length; i++) {
    // Proof layers
    var cwProofLayer = proofDoc.layers.add();
    cwProofLayer.name = cwLayers[i];

    // Art layers
    var cwArtLayer = artDoc.layers.getByName(cwLayers[i]);
    artDoc.activeLayer = cwArtLayer;
    cwArtLayer.hasSelectedArtwork = true;

    // Copy art to proof
    app.activeDocument = artDoc;
    app.copy();
    artDoc.selection = null;
    app.activeDocument = proofDoc;
    proofDoc.activeLayer = cwProofLayer;
    app.paste();

    // If selection isn't 1 item or 1 group, create group
    if (proofDoc.selection.length > 1) {
      app.executeMenuCommand("group");
    }

    // Pasted art in proof doc
    var pastedArt = proofDoc.selection[0];

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

    // Create SHIRT for CW layer
    var cwShirt = shirt.duplicate();
    cwShirt.move(cwProofLayer, ElementPlacement.PLACEATEND);

    // Resize shirt w/ 0.50" margins
    cwShirt.width = pastedArt.width + 36;
    cwShirt.height = pastedArt.height + 36;

    // Center art & shirt on artboard
    centerOnArtboard(pastedArt, artBoard);
    centerOnArtboard(cwShirt, artBoard);

    // Position art & shirt if overlap into header
    toTallPosition(pastedArt, cwShirt);

    // Add CW_# note above proof
    addNote(cwLayers[i], cwProofLayer);

    // Deselect everything
    proofDoc.selection = null;
  }

  // Delete shirt from PROOF layer
  shirt.remove();

  // Change White swatches to pure white
  toProofWhite();

  // Input for Order / Art # / Due Date
  //@include './SP_PageProof_OrderArtDuePrompt.jsx';

  // Arrange CW layers
  //@include './SP_PageProofCW_Arrange.jsx';
}
