function SP_Check_Opacity() {
  // Active Document
  var doc = app.activeDocument;

  // Layers in document
  var docLayers = doc.layers;

  // Exit if no Art layer
  if (!isLayerNamed("Art", docLayers)) {
    throw new Error("No Layer named 'Art'" + "\n" + "Art to be scanned needs to be on a layer named 'Art'");
  }

  // Art layer
  var artLayer = docLayers.getByName("Art");

  // Exit if nothin on Art layer
  if (!artLayer.pageItems.length) {
    throw new Error("No art on 'Art' Layer" + "\n" + "Place art to be scanned on the layer named 'Art'");
  }

  // Metadata layer
  var metadataLayer = docLayers.getByName("Metadata");

  // Paths & Compound Paths in Art Layer
  var artPaths = artLayer.pathItems;
  var artCompoundPaths = artLayer.compoundPathItems;

  // Metadata Page Items
  var metaPageItems = metadataLayer.pageItems;

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

  // Find & select metaPageItems with less than 100% opacity
  for (var i = 0; i < metaPageItems.length; i++) {
    if (metaPageItems[i].opacity < 100) {
      metaPageItems[i].selected = true;
      opacityCounter++;
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
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "SP_Template") {
    SP_Check_Opacity();
  } else {
    throw new Error("SP Template File Not Active");
  }
} catch (e) {
  alert(e, "Script Alert", true);
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
