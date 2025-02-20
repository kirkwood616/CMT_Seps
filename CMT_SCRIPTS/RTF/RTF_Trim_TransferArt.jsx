function RTF_Trim_TransferArt() {
  // Active Document
  var doc = app.activeDocument;

  // Target Metadata Layer
  var metadataLayer = doc.layers.getByName("Metadata");

  // Lock Metadata Layer
  metadataLayer.locked = true;

  // Target Art Layer
  var artLayer = doc.layers.getByName("Transfer Art");
  doc.activeLayer = artLayer;

  // Select Art Group on Art Layer
  artLayer.hasSelectedArtwork = true;

  // Group & Trim Artwork
  app.executeMenuCommand("group");
  app.executeMenuCommand("Live Pathfinder Trim");
  app.executeMenuCommand("expandStyle");

  // Deselect everything
  doc.selection = false;
}

// Run
try {
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "RTF_Template") {
    RTF_Trim_TransferArt();
  } else {
    throw new Error("RTF Template File Not Active");
  }
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
}
