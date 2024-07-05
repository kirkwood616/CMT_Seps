function SP_Set_Location_2inch() {
  // Illustrator Coordinate System
  app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;

  // Active Document
  var doc = app.activeDocument;

  // Layers in document
  var docLayers = doc.layers;

  // Select Art layer (if exists) or exit if layer or selection
  if (!doc.selection.length) {
    if (isLayerNamed("Art", docLayers)) {
      var artLayer = docLayers.getByName("Art");
      artLayer.hasSelectedArtwork = true;
    } else {
      throw new Error("No Art Selected.");
    }
  }

  // If selection isn't 1 item or 1 group, create group
  if (doc.selection.length > 1) {
    app.executeMenuCommand("group");
  }

  // Artboard Index
  var artboardIndex = doc.artboards.getActiveArtboardIndex();

  // Artboard rectangle bounding coordinates array
  var artboardBounds = doc.artboards[artboardIndex].artboardRect;

  // Metadata
  var metaLayer = docLayers.getByName("Metadata");
  var metaGroup = metaLayer.groupItems.getByName("MetaGroup");

  // Registration
  var regLayer = docLayers.getByName("Registration");
  var regTopCenter = regLayer.groupItems.getByName("REG_TOP_CENTER");
  var regBottomCenter = regLayer.groupItems.getByName("REG_BOTTOM_CENTER");

  // Top-center registration visible
  regTopCenter.hidden = false;

  // Positioning
  var artSelection = doc.selection[0];
  var centerPosition = (artboardBounds[2] - artboardBounds[0]) / 2 - doc.selection[0].width / 2;
  var regCenteredPosition = 553.22509765623;
  // Position selection centered & 1" down from top of artboard
  artSelection.position = [centerPosition, -72];
  // Position top-center registration at 0.125" from top of artboard
  regTopCenter.position = [regCenteredPosition, -9];
  // Position bottom-center registration 0.50" down from art
  regBottomCenter.position = [regCenteredPosition, yPositionRegBottom(artSelection)];
  // Position metaGroup to regTopCenter
  metaGroup.position = [487.296692817155, -8.99994692380005];
}

// Run
try {
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "SP_Template") {
    SP_Set_Location_2inch();
  } else {
    throw new Error("SP Template File Not Active");
  }
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
}

//*******************
// Helper functions
//*******************

/**
 * Checks if a string matches any layer's name.
 * @param {String} name Name to check layer.name for
 * @param {Layers} layers All Layers in the document
 * @returns {Boolean}
 */
function isLayerNamed(name, layers) {
  for (var i = 0; i < layers.length; i++) {
    if (layers[i].name === name) {
      return true;
    }
  }

  return false;
}

/**
 * Returns the Y position for the bottom registration mark.
 *
 * Accounts for a 0.50" margin from the bottom of the art to the top of registration mark.
 * @param {any} selection Current selection
 * @returns {number}
 */
function yPositionRegBottom(selection) {
  var artHeight = selection.height;
  var yPositionArtBottom = selection.position[1] * -1 + artHeight;

  return yPositionArtBottom * -1 - 36;
}
