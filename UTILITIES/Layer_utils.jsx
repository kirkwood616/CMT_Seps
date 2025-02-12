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
