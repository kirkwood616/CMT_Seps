//@include '../UTILITIES/Settings.jsx';
//@include '../UTILITIES/Proofs.jsx';
//@include '../UTILITIES/FormatText.jsx';

function DTF_Names_CutProof_FromTemplate() {
  // Active DTF Template Document
  var templateDoc = app.activeDocument;

  // Extract order & art numbers
  var orderArtValues = splitOrderArtNamesDTF(templateDoc.layers[0].name);
  var theOrderNumber = orderArtValues[0];
  var theArtNumber = orderArtValues[1];

  // Deselect everything
  templateDoc.selection = null;

  // Select layer art + copy
  templateDoc.layers[0].hasSelectedArtwork = true;
  app.copy();

  // Deselect everything
  templateDoc.selection = null;

  // Set up & load settings
  var settingsFile = setupSettingsFile(
    "CMT_Seps_Settings",
    "Settings_Config.json",
  );
  var settingsData = loadJSONData(settingsFile);
  var proofDocPath = settingsData.DTF_proofTemplatePath;

  // Open Cut Proof Template
  app.open(new File(proofDocPath));

  // DTF Cut Proof Document
  var proofDoc = app.activeDocument;
  var proofLayerNames = proofDoc.layers.getByName("ART");

  // Prompt for Due Date & set
  var dueDate = proofDoc.textFrames.getByName("DUE_DATE");
  dueDate.contents = dateToday();
  var newDueDate = prompt("ENTER DUE DATE", dateToday(), "DUE DATE");

  if (newDueDate) {
    dueDate.textRange.contents = newDueDate;
  }

  //// PROOF Meta
  var proofOrderNumber = proofDoc.textFrames.getByName("ORDER_NUMBER");
  proofOrderNumber.contents = theOrderNumber;
  var proofArtNumber = proofDoc.textFrames.getByName("ART_NUMBER");
  proofArtNumber.contents = theArtNumber;

  //// PROOF Background
  var proofBackgroundLayer = proofDoc.layers.getByName("BACKGROUND");
  var proofBackground = proofBackgroundLayer.pathItems.getByName("_BG");
  var proofBackgroundPosition = proofBackground.position;
  var proofBackgroundDimensions = [
    proofBackground.width,
    proofBackground.height,
  ];

  // Deselect everything
  proofDoc.selection = null;

  // Paste into layer
  proofDoc.activeLayer = proofLayerNames;
  app.paste();

  // Stroke color for border box
  var borderStroke = new CMYKColor();
  borderStroke.cyan = 0;
  borderStroke.magenta = 100;
  borderStroke.yellow = 100;
  borderStroke.black = 0;

  // Add cut borders
  var sel = proofDoc.selection;

  for (var i = sel.length; i--; ) {
    var itemPosition = sel[i].position;
    var itemHeight = sel[i].height;
    var itemWidth = sel[i].width;
    var borderBox = proofLayerNames.pathItems.rectangle(
      0,
      0,
      itemWidth + 36,
      itemHeight + 36,
    );
    borderBox.move(proofLayerNames, ElementPlacement.PLACEATEND);
    borderBox.selected = true;
    borderBox.filled = false;
    borderBox.stroked = true;
    borderBox.strokeWidth = 2;
    borderBox.strokeColor = borderStroke;
    borderBox.strokeDashes = [8];
    borderBox.position = [itemPosition[0] - 18, itemPosition[1] + 18];
  }

  // Group & target current art
  app.executeMenuCommand("group");
  var pastedArt = proofDoc.selection[0];

  // Resize art to 7.5" wide if over
  if (pastedArt.width > 540) {
    var xScaleBy = (540 / pastedArt.width) * 100;
    pastedArt.resize(xScaleBy, xScaleBy);
  }

  // Resize art to 10" high if over
  if (pastedArt.height > 720) {
    var yScaleBy = (720 / pastedArt.height) * 100;
    pastedArt.resize(yScaleBy, yScaleBy);
  }

  // Calculate remainder space between selection & background
  var yPosBG = proofBackgroundPosition[1];
  var heightBG = proofBackgroundDimensions[1];
  var heightRemainder = heightBG - proofDoc.selection[0].height;

  // Position selection centered in background
  var artboard_x =
    proofDoc.artboards[0].artboardRect[0] +
    proofDoc.artboards[0].artboardRect[2];
  proofDoc.selection[0].position = [
    (artboard_x - proofDoc.selection[0].width) / 2,
    yPosBG - heightRemainder / 2,
  ];

  // Deselect everything
  proofDoc.selection = null;

  // Lock Proof Metadata layer
  proofDoc.layers.getByName("Metadata").locked = true;

  // Change White swatches to pure white
  toProofWhite();
}

// Run
try {
  if (
    app.documents.length > 0 &&
    app.activeDocument.artboards[0].name === "DTF_Template"
  ) {
    DTF_Names_CutProof_FromTemplate();
  } else {
    throw new Error("Template File Not Active");
  }
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
}
