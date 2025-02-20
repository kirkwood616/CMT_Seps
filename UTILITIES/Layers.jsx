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
 * @returns {void}
 */
function selectArtLayer() {
  if (!app.activeDocument.selection.length) {
    if (isLayerNamed("Art")) {
      app.activeDocument.layers.getByName("Art").hasSelectedArtwork = true;
    } else {
      throw new Error("No Art Layer or Selected Art.");
    }
  }

  if (app.activeDocument.selection.length > 1) app.executeMenuCommand("group");
}
