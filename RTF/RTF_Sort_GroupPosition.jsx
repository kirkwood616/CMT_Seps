function RTF_Sort_GroupPosition() {
  // Active Document
  var doc = app.activeDocument;

  // Transfer Art Layer
  var artLayer = doc.layers.getByName("Transfer Art");

  // Groups in Transfer Art Layer
  var artLayerGroups = artLayer.groupItems;

  // Exit if 1 color
  if (artLayerGroups.length === 1) {
    return;
  }

  // New Layer to replace Art Layer containing sorted groups
  var newArtLayer = doc.layers.add();

  // Place new layer at end
  newArtLayer.move(doc, ElementPlacement.PLACEATEND);

  // Storage variable of all groups' position numbers
  var positionNumbers = [];

  // Populate position storage with art groups' position numbers
  for (var i = 0; i < artLayerGroups.length; i++) {
    var num = parseInt(artLayerGroups[i].name[0]);
    positionNumbers.push(num);
  }

  // Sort storage numbers ascending numerically
  positionNumbers.sort();

  // Loop over storage numbers in reverse order
  for (var i = positionNumbers.length; i--; ) {
    // Loop over artLayerGroups in reverse order
    for (var j = artLayerGroups.length; j--; ) {
      // Check if storage number equals group position
      if (positionNumbers[i] === parseInt(artLayerGroups[j].name[0])) {
        // Duplicate group
        var matchDuplicate = artLayerGroups[j].duplicate();
        // Move duplicate to new layer at beggining position
        matchDuplicate.move(newArtLayer, ElementPlacement.PLACEATBEGINNING);
      }
    }
  }

  // Delete original Transfer Art layer
  artLayer.remove();

  // Rename new sorted layer as original name
  newArtLayer.name = "Transfer Art";
}

// Run
try {
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "RTF_Template") {
    RTF_Sort_GroupPosition();
  } else {
    throw new Error("RTF Template File Not Active");
  }
} catch (e) {
  alert(e, "Script Alert", true);
}
