function NTF_Recolor_Cleanup() {
  // Active Document
  var doc = app.activeDocument;
  var docLayers = doc.layers;

  // Deselect everything
  doc.selection = null;

  // Delete empty layers
  for (var i = 0; i < docLayers.length; i++) {
    if (!docLayers[i].visible) docLayers[i].visible = true;
    if (docLayers[i].pageItems.length < 1) docLayers[i].remove();
  }

  // Recolor everything on a layer to the swatch matching it's name
  for (var i = 3; i < docLayers.length; i++) {
    var layerSwatch = getLayerSwatch(docLayers[i].name);
    docLayers[i].hasSelectedArtwork = true;
    doc.defaultFillColor = layerSwatch.color;
    doc.selection = null;
  }
}

// Run
try {
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "NTF_Template") {
    NTF_Recolor_Cleanup();
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
 * Finds the swatch that contains the supplied layer name & returns the swatch.
 * @param {string}    layerName Name of a layer
 * @returns {Swatch}  The swatch with a matching name
 */
function getLayerSwatch(layerName) {
  for (var i = 0; i < app.activeDocument.swatches.length; i++) {
    if (app.activeDocument.swatches[i].name.indexOf(layerName) !== -1) {
      return app.activeDocument.swatches[i];
    }
  }
}
