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
