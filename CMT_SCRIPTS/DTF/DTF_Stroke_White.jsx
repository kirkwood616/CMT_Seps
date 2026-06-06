//@include '../UTILITIES/Layers.jsx';

function DTF_Stroke_White() {
  // Active Document
  var doc = app.activeDocument;
  var docSwatches = doc.swatches;

  // Setting Values
  var STROKE_WIDTH = 1; // points
  var NEW_LAYER_NAME = "1pt White Stroke";

  // Deselect everything
  doc.selection = null;

  // Find Spot White & select fill
  var spotWhiteColor;

  for (var i = 0; i < docSwatches.length; i++) {
    if (docSwatches[i].name.indexOf("Spot White") > -1) {
      spotWhiteColor = docSwatches[i].color;
      doc.defaultFillColor = docSwatches[i].color;
      app.executeMenuCommand("Find Fill Color menu item");
    }
  }

  // redraw catch-up hack
  app.redraw();

  // Exit if no Spot White selection
  if (doc.selection.length < 1) {
    throw new Error("No Spot White Found In Art");
  }

  // Add Stroke Layer
  var strokeLayer;

  if (isLayerNamed(NEW_LAYER_NAME)) {
    strokeLayer = doc.layers.getByName(NEW_LAYER_NAME);
  } else {
    strokeLayer = doc.layers.add();
    strokeLayer.name = NEW_LAYER_NAME;
  }

  // Delete all items on stroke layer
  if (strokeLayer.pageItems.length > 0) {
    strokeLayer.pageItems.removeAll();
  }
  // Send stroke layer to bottom
  strokeLayer.zOrder(ZOrderMethod.SENDTOBACK);

  // Copy, paste in stroke layer, add stroke & expand stroke
  app.copy();
  doc.selection = null;
  doc.activeLayer = strokeLayer;
  app.executeMenuCommand("pasteInPlace");
  app.executeMenuCommand("group");
  app.executeMenuCommand("Live Pathfinder Add");
  app.executeMenuCommand("expandStyle");
  app.activeDocument.defaultStrokeColor = spotWhiteColor;
  app.activeDocument.defaultStrokeWidth = STROKE_WIDTH;
  app.executeMenuCommand("OffsetPath v22");

  // Deselect everything
  doc.selection = null;

  // Top Layer set to active layer
  doc.activeLayer = doc.layers[0];
}

// Run
try {
  if (
    app.documents.length > 0 &&
    app.activeDocument.artboards[0].name === "DTF_Template"
  ) {
    DTF_Stroke_White();
  } else {
    throw new Error("DTF Template File Not Active");
  }
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
}
