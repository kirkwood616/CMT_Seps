function RTF_Unite_LastColor() {
  // Active Document
  var doc = app.activeDocument;

  // Swatches
  var docSwatches = doc.swatches;

  // Target "Transfer Art" layer
  var artLayer = doc.layers.getByName("Transfer Art");

  // Target color groups on artLayer
  var artLayerGroups = artLayer.groupItems;

  // Add to ArtGroup & Exit if 1 color
  if (artLayerGroups.length === 1) {
    // Create ArtGroup & name
    var newArtGroup = artLayerGroups.add();
    newArtGroup.name = "ArtGroup";

    // Move color group inside of ArtGroup
    artLayerGroups[1].move(newArtGroup, ElementPlacement.PLACEATEND);

    // Deselect everything
    doc.selection = false;

    return;
  }

  // Target last color group on artLayer
  var lastColor = artLayerGroups[artLayerGroups.length - 1];

  // Name of last color group
  var lastColorGroup = artLayerGroups[artLayerGroups.length - 1];
  var lastColorName = lastColor.name.slice(2);

  // Swatch name of lastColor
  var lastColorSwatch = docSwatches.getByName(lastColorName);

  // Deselect everything
  doc.selection = false;

  // Copy artLayer for last color
  var artLayerCopy = doc.layers.add();

  // Duplicate artLayer groups to artLayerCopy
  for (var i = artLayerGroups.length; i--; ) {
    var groupCopy = artLayerGroups[i].duplicate();
    groupCopy.move(artLayerCopy, ElementPlacement.PLACEATBEGINNING);
  }

  // Make compound path & color of last group
  artLayerCopy.hasSelectedArtwork = true;
  app.executeMenuCommand("compoundPath");
  doc.defaultFillColor = lastColorSwatch.color;

  // Group compound path, Unite (Add) & name to lastColorGroup
  app.executeMenuCommand("group");
  app.executeMenuCommand("Live Pathfinder Add");
  app.executeMenuCommand("expandStyle");
  doc.selection[0].name = lastColorGroup.name;

  // Deselect everything
  doc.selection = false;

  // Delete last color group from artLayer
  lastColorGroup.remove();

  // Move new last color to lastColorGroup position on artLayer
  artLayerCopy.groupItems[0].move(artLayer, ElementPlacement.PLACEATEND);

  // Delete artLayerCopy
  artLayerCopy.remove();

  // Group all color groups on artLayer to named "ArtGroup"
  artLayer.hasSelectedArtwork = true;
  app.executeMenuCommand("group");
  doc.selection[0].name = "ArtGroup";

  // Deselect everything
  doc.selection = false;
}

// Run
try {
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "RTF_Template") {
    RTF_Unite_LastColor();
  } else {
    throw new Error("RTF Template File Not Active");
  }
} catch (e) {
  alert(e, "Script Alert", true);
}
