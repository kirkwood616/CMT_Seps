/**
 * Adds a WHITE UB swatch to the document if not present in swatches.
 * @returns {void}
 */
function addSwatchUB() {
  var doc = app.activeDocument;
  var docSwatches = doc.swatches;
  var swatchStorage = new Array();

  // Exit if WHITE UB swatch found
  for (var i = 0; i < docSwatches.length; i++) {
    if (docSwatches[i].name.indexOf("WHITE UB") !== -1) {
      return;
    }
  }

  // Add swatches to storage
  for (var i = 0; i < docSwatches.length; i++) {
    if (docSwatches[i].name !== "[None]" && docSwatches[i].name !== "[Registration]") {
      swatchStorage.push(docSwatches[i]);
    }
  }

  // Add swatch group
  var swatchGroup = doc.swatchGroups.add();

  // Add swatches from storage to swatch group
  for (var i = 0; i < swatchStorage.length; i++) {
    swatchGroup.addSwatch(swatchStorage[i]);
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
 * @param {Layers} layers Layers in document
 * @returns {Layer}
 */
function createNewLayerUB(name, layers) {
  var newLayerUB = layers.add();
  newLayerUB.name = name;
  newLayerUB.zOrder(ZOrderMethod.SENDTOBACK);
  return newLayerUB;
}

/**
 * Creates a new named layer and sends to back.
 * @param {String} name Name of new layer
 * @param {Layers} layers Layers in document
 * @returns {Layer}
 */
function createNewLayerUB(name, layers) {
  var newLayerUB = layers.add();
  newLayerUB.name = name;
  newLayerUB.zOrder(ZOrderMethod.SENDTOBACK);
  return newLayerUB;
}

/**
 * Creates a UB from the current selection, colors it to the first WHITE UB swatch found, and moves it to a specific layer.
 * @param {Layer} layer The Layer to move UB to
 * @param {Swatches} swatches Swatches in the current document
 * @param {Document} document Current document
 */
function createUB(layer, swatches, document) {
  app.executeMenuCommand("copy");
  document.selection = false;
  app.executeMenuCommand("pasteFront");
  app.executeMenuCommand("group");
  app.executeMenuCommand("Live Pathfinder Add");
  app.executeMenuCommand("expandStyle");
  document.selection[0].move(layer, ElementPlacement.PLACEATEND);

  for (var i = 0; i < swatches.length; i++) {
    var currentSwatch = swatches[i];
    var indexNameMatch = currentSwatch.name.indexOf("WHITE UB");

    if (indexNameMatch !== -1) {
      document.defaultFillColor = currentSwatch.color;
      break;
    }
  }

  defaultStroke(document);
  //@include '../UTILITIES/Overprint_Fill_True.jsx';
  document.selection = false;
}

/**
 * Creates a UB from the current selection, colors it to the first WHITE UB swatch found, and moves it to a specific layer.
 * @param {Layer} layer The Layer to move UB to
 * @param {Swatches} swatches Swatches in the current document
 * @param {Document} document Current document
 */
function createSelectUB(layer, swatches, document) {
  app.executeMenuCommand("group");
  app.executeMenuCommand("Live Pathfinder Add");
  app.executeMenuCommand("expandStyle");
  document.selection[0].move(layer, ElementPlacement.PLACEATEND);

  for (var i = 0; i < swatches.length; i++) {
    var currentSwatch = swatches[i];
    var indexNameMatch = currentSwatch.name.indexOf("WHITE UB");

    if (indexNameMatch !== -1) {
      document.defaultFillColor = currentSwatch.color;
      break;
    }
  }

  defaultStroke(document);
  document.selection = false;
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
