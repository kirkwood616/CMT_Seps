/**
 * Adds a WHITE UB swatch to the document if not present in swatches.
 * @returns {void}
 */
function addSwatchUB() {
  var doc = app.activeDocument;
  var docSwatches = doc.swatches;

  // Exit if WHITE UB swatch found
  for (var i = 0; i < docSwatches.length; i++) {
    if (docSwatches[i].name.indexOf("WHITE UB") !== -1) {
      return;
    }
  }

  // Add swatch group
  var swatchGroup = doc.swatchGroups.add();

  // Add swatches from storage to swatch group
  for (var i = docSwatches.length; i--; ) {
    if (docSwatches[i].name !== "[None]" && docSwatches[i].name !== "[Registration]") {
      swatchGroup.addSwatch(docSwatches[i]);
    }
  }

  // Create WHITE UB swatch
  var newCMYK = new CMYKColor();
  newCMYK.cyan = 83.53;
  newCMYK.magenta = 0;
  newCMYK.yellow = 0;
  newCMYK.black = 0;

  var thisSpot = doc.spots.add();
  thisSpot.name = "WHITE UB";
  thisSpot.color = newCMYK;
  thisSpot.colorType = ColorModel.SPOT;

  // Move swatches back & delete swatch group
  var groupSwatches = swatchGroup.getAllSwatches();

  for (var i = 0; i < groupSwatches.length; i++) {
    doc.swatchGroups[0].addSwatch(groupSwatches[i]);
  }

  swatchGroup.remove();
}

/**
 * Creates a new named layer and sends to back.
 * @param {String} name Name of new layer
 * @returns {Layer}
 */
function createNewLayerUB(name) {
  var newLayerUB = app.activeDocument.layers.add();
  newLayerUB.name = name;
  newLayerUB.zOrder(ZOrderMethod.SENDTOBACK);
  return newLayerUB;
}

/**
 * Creates a UB from the current selection, colors it to the first WHITE UB swatch found, and moves it to a specific layer.
 * @param {Layer} layer The Layer to move UB to
 */
function createUB(layer) {
  app.executeMenuCommand("copy");
  app.activeDocument.selection = false;
  app.executeMenuCommand("pasteFront");
  app.executeMenuCommand("group");
  app.executeMenuCommand("Live Pathfinder Add");
  app.executeMenuCommand("expandStyle");
  app.activeDocument.selection[0].move(layer, ElementPlacement.PLACEATEND);

  for (var i = 0; i < app.activeDocument.swatches.length; i++) {
    var indexNameMatch = app.activeDocument.swatches[i].name.indexOf("WHITE UB");

    if (indexNameMatch !== -1) {
      app.activeDocument.defaultFillColor = app.activeDocument.swatches[i].color;
      break;
    }
  }

  defaultStrokeUB(app.activeDocument);
  //@include '../UTILITIES/Overprint_Fill_True.jsx';
  app.activeDocument.selection = false;
}

/**
 * Creates a UB from the current selection, colors it to the first WHITE UB swatch found, and moves it to a specific layer.
 * @param {Layer} layer The Layer to move UB to
 */
function createSelectedUB(layer) {
  app.executeMenuCommand("group");
  app.executeMenuCommand("Live Pathfinder Add");
  app.executeMenuCommand("expandStyle");
  app.activeDocument.selection[0].move(layer, ElementPlacement.PLACEATEND);

  for (var i = 0; i < app.activeDocument.swatches.length; i++) {
    var indexNameMatch = app.activeDocument.swatches[i].name.indexOf("WHITE UB");

    if (indexNameMatch !== -1) {
      app.activeDocument.defaultFillColor = app.activeDocument.swatches[i].color;
      break;
    }
  }

  defaultStrokeUB(app.activeDocument);
  //@include '../UTILITIES/Overprint_Fill_True.jsx';
  app.activeDocument.selection = false;
}

/**
 * Adds a stroke & sets it's width on the selection to Process White.
 * @param {Document} document Current document
 */
function defaultStrokeUB(document) {
  var strokeColor = new CMYKColor();
  strokeColor.cyan = 0;
  strokeColor.magenta = 0;
  strokeColor.yellow = 0;
  strokeColor.black = 0;

  document.defaultStrokeColor = strokeColor;
  document.defaultStrokeWidth = 0.4;
}
