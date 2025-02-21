//@include '../UTILITIES/Layers.jsx';

function SP_CW_Add() {
  // Active Document
  var doc = app.activeDocument;

  // De-select everything
  doc.selection = null;

  // Exit if no CW_ layers
  if (!cwLayersExist()) throw new Error("No CW Layers");

  // Layers named CW_
  var cwLayers = new Array();

  // Populate cwLayers
  for (var i = 0; i < doc.layers.length; i++) {
    if (doc.layers[i].name.indexOf("CW_") > -1) cwLayers.push(doc.layers[i].name);
  }

  // Exit if no CW_ layers
  if (!cwLayers.length) throw new Error("No CW Layers");

  // Last (top level) CW_ number layer
  var cwLastLayer = doc.layers.getByName(cwLayers[0]);

  // Add new CW_ layer +1 relative to cwLastLayer's # suffix
  var cwNewLayer = doc.layers.add();
  cwNewLayer.name = "CW_" + (parseInt(cwLastLayer.name.slice(-1)) + 1).toString();

  // Move new CW_ layer above the last (top level) CW_ layer
  cwNewLayer.move(cwLastLayer, ElementPlacement.PLACEBEFORE);

  // Duplicate art from last (top level) CW_ layer to new CW_ layer
  cwLastLayer.hasSelectedArtwork = true;
  if (doc.selection.length > 1) app.executeMenuCommand("group");
  app.copy();
  doc.selection = null;
  doc.activeLayer = cwNewLayer;
  app.executeMenuCommand("pasteInPlace");
  doc.selection = null;
}

// Run
try {
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "SP_Template") {
    SP_CW_Add();
  } else {
    throw new Error("SP Template File Not Active");
  }
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
}
