function RTF_Check_Opacity() {
  // Active Document
  var doc = app.activeDocument;

  // Layers in document
  var docLayers = doc.layers;

  // Target Transfer Art layer
  var artLayer = docLayers.getByName("Transfer Art");

  // Paths & Compound Paths in Art Layer
  var artPaths = artLayer.pathItems;
  var artCompoundPaths = artLayer.compoundPathItems;

  // Opacity seleted counter;
  var opacityCounter = 0;

  // Deselect everything
  doc.selection = false;

  // Find & select Paths with less than 100% opacity
  for (var i = 0; i < artPaths.length; i++) {
    var currentPath = artPaths[i];

    if (currentPath.opacity < 100) {
      currentPath.selected = true;
      opacityCounter++;
    }
  }

  // Find & select Compound Paths with less than 100% opacity
  for (var i = 0; i < artCompoundPaths.length; i++) {
    var currentCompound = artCompoundPaths[i];

    if (artCompoundPaths[i].opacity < 100) {
      artCompoundPaths[i].selected = true;
      opacityCounter++;
    }

    // Find & select Paths within Compound Path with less than 100% opacity
    for (var j = 0; j < currentCompound.pathItems.length; j++) {
      var pathInCompound = currentCompound.pathItems[j];

      if (pathInCompound.opacity < 100) {
        pathInCompound.selected = true;
        opacityCounter++;
      }
    }
  }

  // Alert
  if (opacityCounter > 0) {
    alert(
      "Item(s) with less than 100% Opacity found" +
        "\n" +
        "Item(s) currently selected." +
        "\n" +
        "Adjust Opacity if required." +
        "\n\n" +
        "Opacity is adjusted through the Transparency Window." +
        "\n\n" +
        "Re-run this action to check if further adjustments are needed."
    );
  } else {
    alert(opacityCounter + " items with less than 100% Opacity found." + "\n" + "Proceed.");
  }
}

// Run
try {
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "RTF_Template") {
    RTF_Check_Opacity();
  } else {
    throw new Error("RTF Template File Not Active");
  }
} catch (e) {
  alert(e, "Script Alert", true);
}
