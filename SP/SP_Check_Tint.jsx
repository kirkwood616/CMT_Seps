function SP_Check_Tint() {
  // Active Document
  var doc = app.activeDocument;

  // Target Art & Metadata layers
  var artLayer = doc.layers.getByName("Art");
  var metadataLayer = doc.layers.getByName("Metadata");

  // Paths & Compound Paths in Art Layer
  var artPaths = artLayer.pathItems;
  var artCompoundPaths = artLayer.compoundPathItems;

  // Tint seleted counter;
  var tintCounter = 0;

  // Unlock metadataLayer
  metadataLayer.locked = false;

  // Deselect everything
  doc.selection = false;

  // Find & select Paths with color tint applied
  for (var i = 0; i < artPaths.length; i++) {
    var currentPath = artPaths[i];

    if (currentPath.fillColor.tint < 100) {
      currentPath.selected = true;
      tintCounter++;
    }
  }

  // Find & select Compound Paths with with color tint applied
  for (var i = 0; i < artCompoundPaths.length; i++) {
    var currentCompound = artCompoundPaths[i];

    // Find & select Paths within Compound Path with with color tint applied
    for (var j = 0; j < currentCompound.pathItems.length; j++) {
      var pathInCompound = currentCompound.pathItems[j];

      if (pathInCompound.fillColor.tint < 100) {
        pathInCompound.selected = true;
        tintCounter++;
      }
    }
  }

  for (var k = 0; k < metadataLayer.textFrames.length; k++) {
    if (metadataLayer.textFrames[k].textRange.characterAttributes.fillColor.tint < 100) {
      metadataLayer.textFrames[k].selected = true;
      tintCounter++;
    }
  }

  // Alert
  if (tintCounter > 0) {
    alert(
      "Item(s) with less than 100% Tint found" +
        "\n" +
        "Item(s) currently selected." +
        "\n" +
        "Adjust Tint if required." +
        "\n\n" +
        "Tints are adjusted through the Color Window." +
        "\n\n" +
        "Re-run this action to check if further adjustments are needed."
    );
  } else {
    alert(tintCounter + " items with less than 100% Tint found." + "\n" + "Proceed.");
  }
}

// Run
try {
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "SP_Template") {
    SP_Check_Tint();
  } else {
    throw new Error("SP Template File Not Active");
  }
} catch (e) {
  alert(e, "Script Alert", true);
}
