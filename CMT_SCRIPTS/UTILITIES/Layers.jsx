/**
 * Checks if a string matches any layer's name.
 * @param {String} name Name to check layer.name for
 * @returns {Boolean}
 */
function isLayerNamed(name) {
  for (var i = 0; i < app.activeDocument.layers.length; i++) {
    if (app.activeDocument.layers[i].name === name) {
      return true;
    }
  }

  return false;
}

/**
 * Searches layer names for 'Art' layer. If present, selects its contents and creates a group if not currently grouped.
 *
 * If items are currently selected, it will group the items if they are not grouped.
 * @returns {void}
 */
function selectArtLayer() {
  if (app.activeDocument.selection.length) {
    if (app.activeDocument.selection.length > 1)
      app.executeMenuCommand("group");
    return;
  }

  if (isLayerNamed("Art")) {
    if (!app.activeDocument.layers.getByName("Art").pageItems.length) {
      throw new Error("No Items on Art Layer. Select Art.");
    }
    app.activeDocument.activeLayer = app.activeDocument.layers.getByName("Art");
    app.activeDocument.layers.getByName("Art").hasSelectedArtwork = true;
    if (app.activeDocument.selection.length > 1)
      app.executeMenuCommand("group");
  } else {
    throw new Error("No Art Layer or Selected Art.");
  }
}

/**
 * Checks if any layers in the active document's name begin with 'CW_'
 * @returns {Boolean}
 */
function cwLayersExist() {
  for (var i = 0; i < app.activeDocument.layers.length; i++) {
    if (app.activeDocument.layers[i].name.indexOf("CW_") !== -1) {
      return true;
    }
  }

  return false;
}

/**
 * Loops all the layers in the active document and stores their name &
 * visibility in an object, returning an array of all layer objects.
 * @returns {Array<{name: String, visible: Boolean}>}
 */
function storeLayerVisibility() {
  var layerStates = new Array();

  for (var i = 0; i < app.activeDocument.layers.length; i++) {
    var layer = app.activeDocument.layers[i];

    layerStates.push({
      name: layer.name,
      visible: layer.visible,
    });
  }

  return layerStates;
}

/**
 * Takes an array of objects storing the name & visibility setting of
 * each layer and sets the visibility to the value for the named layer
 * in the active document.
 * @param {Array<{name: String, visible: Boolean}>} visibleLayers
 */
function restoreVisibleLayers(visibleLayers) {
  var documentLayers = app.activeDocument.layers;

  for (var i = 0; i < documentLayers.length; i++) {
    for (var j = 0; j < visibleLayers.length; j++) {
      if (documentLayers[i].name === visibleLayers[j].name) {
        documentLayers[i].visible = visibleLayers[j].visible;
      }
    }
  }
}
