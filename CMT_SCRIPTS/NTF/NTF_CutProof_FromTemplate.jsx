//@include '../UTILITIES/Settings.jsx';
//@include '../UTILITIES/Proofs.jsx';

function NTF_CutProof_FromTemplate() {
  // Active NTF Template Document
  var templateDoc = app.activeDocument;

  // Deselect everything
  templateDoc.selection = null;

  // Layers
  var templateLayers = templateDoc.layers;

  // Store for named color layers in NTF Template Document
  var templateColorLayers = new Array();

  for (var i = templateLayers.length; i--; ) {
    if (templateLayers[i].name.indexOf("_") !== -1) {
      templateColorLayers.push(templateLayers[i]);
    }
  }

  // Set up & load settings
  var settingsFile = setupSettingsFile(
    "CMT_Seps_Settings",
    "Settings_Config.json",
  );
  var settingsData = loadJSONData(settingsFile);
  var proofDocPath = settingsData.NTF_proofTemplatePath;

  // Open Cut Proof Template
  app.open(new File(proofDocPath));

  // NTF Cut Proof Template
  var proofDoc = app.activeDocument;
  proofDoc.selection = null;

  // Prompt for Due Date & set
  var dueDate = proofDoc.textFrames.getByName("DUE_DATE");
  dueDate.contents = dateToday();
  var newDueDate = prompt("ENTER DUE DATE", dateToday(), "DUE DATE");

  if (newDueDate) {
    dueDate.textRange.contents = newDueDate;
  }

  // Extract Metadata from Template & set on Proof
  /// TEMPLATE Meta
  var templateMetaLayer = templateDoc.layers.getByName("Metadata");
  var templateMetaGroup = templateMetaLayer.groupItems.getByName("MetaGroup");
  var templateOrderName = templateMetaGroup.textFrames.getByName("_ORDER");
  var templateArtName = templateMetaGroup.textFrames.getByName("_ART FILE");
  var templateColorFrame = templateMetaGroup.textFrames.getByName("COLOR");

  //// PROOF Meta
  var proofOrderNumber = proofDoc.textFrames.getByName("ORDER_NUMBER");
  proofOrderNumber.contents = templateOrderName.contents.replace("ORDER ", "");

  var proofArtNumber = proofDoc.textFrames.getByName("ART_NUMBER");
  proofArtNumber.contents = templateArtName.contents.replace("ART FILE: ", "");

  var proofInkColor = proofDoc.textFrames.getByName("INK_COLOR");
  proofInkColor.contents = getColorName(templateColorFrame.contents);

  //// PROOF Artboard
  var proofArtboardIndex = proofDoc.artboards.getActiveArtboardIndex();
  var proofBoard = proofDoc.artboards[proofArtboardIndex];
  var proofRect = proofBoard.artboardRect;
  var offsetH = 20;

  //// PROOF Background
  var proofBackgroundLayer = proofDoc.layers.getByName("BACKGROUND");
  var proofBackground = proofBackgroundLayer.pathItems.getByName("_BG");
  var proofBackgroundPosition = proofBackground.position;
  var proofBackgroundDimensions = [
    proofBackground.width,
    proofBackground.height,
  ];

  // Duplicate artboards based on color layers amount
  if (templateColorLayers.length > 1) {
    proofDoc.selectObjectsOnActiveArtboard();
    app.copy();
  }

  for (var i = 0; i < templateColorLayers.length; i++) {
    if (i === 0) continue;
    var newBoard = proofDoc.artboards.add(proofRect);
    var lastBoard = proofDoc.artboards[i - 1];
    var lastRect = lastBoard.artboardRect;
    newBoard.artboardRect = [
      lastRect[2] + offsetH,
      lastRect[1],
      lastRect[2] + offsetH + (proofRect[2] - proofRect[0]),
      lastRect[3],
    ];
    newBoard.name = "CP_" + (i + 1).toString();
    proofDoc.artboards.setActiveArtboardIndex(i);
    app.executeMenuCommand("paste");
    app.executeMenuCommand("group");
    var artboardWidth = newBoard.artboardRect[2] - newBoard.artboardRect[0];
    var artboardHeight = newBoard.artboardRect[1] - newBoard.artboardRect[3];
    var item = app.activeDocument.selection[0];
    var newX = newBoard.artboardRect[0] + (artboardWidth - item.width) / 2;
    var newY = newBoard.artboardRect[1] - (artboardHeight - item.height) / 2;
    item.position = [newX, newY];
    app.executeMenuCommand("ungroup");
    proofDoc.selection = null;
  }

  if (templateColorLayers.length > 1) {
    for (var i = proofDoc.pathItems.length; i--; ) {
      if (proofDoc.pathItems[i].name === "_BG") {
        proofDoc.pathItems[i].move(
          proofBackgroundLayer,
          ElementPlacement.PLACEATEND,
        );
      }
    }
  }

  // Copy color layers from template and place on Cut Proof
  var proofLayerNames = proofDoc.layers.getByName("NAMES");

  // Stroke color for border box
  var borderStroke = new CMYKColor();
  borderStroke.cyan = 0;
  borderStroke.magenta = 100;
  borderStroke.yellow = 100;
  borderStroke.black = 0;

  // Copy, resize, place & position art w/ stroked borders from template to proof artboards
  for (var i = 0; i < templateColorLayers.length; i++) {
    // Copy & Paste
    app.activeDocument = templateDoc;
    templateColorLayers[i].hasSelectedArtwork = true;
    app.copy();
    templateDoc.selection = null;
    app.activeDocument = proofDoc;
    proofDoc.activeLayer = proofLayerNames;
    proofDoc.artboards.setActiveArtboardIndex(i);
    app.executeMenuCommand("paste");

    // Add cut borders
    var sel = proofDoc.selection;

    for (var j = sel.length; j--; ) {
      var itemPosition = sel[j].position;
      var itemHeight = sel[j].height;
      var itemWidth = sel[j].width;
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

    // Resize art to 9.25" high if over
    if (pastedArt.height > 666) {
      var yScaleBy = (666 / pastedArt.height) * 100;
      pastedArt.resize(yScaleBy, yScaleBy);
    }

    // Calculate remainder space between selection & background
    var yPosBG = proofBackgroundPosition[1];
    var heightBG = proofBackgroundDimensions[1];
    var heightRemainder = heightBG - proofDoc.selection[0].height;

    // Position selection centered in background
    var artboard_x =
      proofDoc.artboards[i].artboardRect[0] +
      proofDoc.artboards[i].artboardRect[2];
    proofDoc.selection[0].position = [
      (artboard_x - proofDoc.selection[0].width) / 2,
      yPosBG - heightRemainder / 2,
    ];

    // Deselect everything
    proofDoc.selection = null;
  }

  // Set Metadata Sheet Counts
  for (var i = 0; i < proofDoc.artboards.length; i++) {
    proofDoc.artboards.setActiveArtboardIndex(i);
    proofDoc.selectObjectsOnActiveArtboard();

    var theSel = proofDoc.selection;
    for (var j = 0; j < theSel.length; j++) {
      if (theSel[j].name === "SHEET_COUNT") {
        theSel[j].contents =
          (i + 1).toString() + " OF " + proofDoc.artboards.length.toString();
        proofDoc.selection = null;
        break;
      }
    }
  }

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
    app.activeDocument.artboards[0].name === "NTF_Template"
  ) {
    NTF_CutProof_FromTemplate();
  } else {
    throw new Error("Template File Not Active");
  }
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
}

//*******************
// Helper functions
//*******************

/**
 * Takes a provided string, from ink color Metadata, trims the string to characters preceding an underscore (if present) and returns the trimmed string.
 * @param {String} name
 * @returns {String}
 */
function getColorName(name) {
  var thisColor = name;

  var _index = name.indexOf("_");

  if (_index !== -1) {
    thisColor = name.slice(0, _index);
  }

  return thisColor;
}
