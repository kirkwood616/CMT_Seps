function RTF_Delete_CMYK_UnusedSwatch_FromNoSwatch() {
  // Active Document
  var doc = app.activeDocument;

  // Spots & Swatches
  var docSpots = doc.spots;
  var docSwatches = doc.swatches;

  // Layers in document
  var docLayers = doc.layers;

  // Target Transfer Art layer
  var artLayer = doc.layers.getByName("Transfer Art");

  // Storage array for all path items
  var pathsArray = new Array();

  // Counter
  var deletedSwatchCounter = 0;

  // Deselect everything
  doc.selection = false;

  // Lock all layers except Transfer Art layer
  for (var i = 0; i < docLayers.length; i++) {
    if (docLayers[i].name !== "Transfer Art") {
      docLayers[i].locked = true;
    }
  }

  // Add all path items to pathsArray
  addPathsToStorage(artLayer, pathsArray);

  // Loop Spot Colors in reverse order
  for (var i = docSpots.length; i--; ) {
    // Current Spot Swatch
    var currentSpot = docSpots[i];

    // Find text. Returns -1 if not found
    var matchNameIndex = currentSpot.name.indexOf("PROCESS COLOR");

    // Delete items & spot swatch if name matches
    if (matchNameIndex !== -1) {
      var colorToDelete = docSwatches[currentSpot.name];

      for (var j = 0; j < pathsArray.length; j++) {
        if (pathsArray[j].fillColor.spot.name === colorToDelete.name) {
          pathsArray[j].remove();
        }
      }

      // Delete spot swatch from palette
      currentSpot.remove();
      deletedSwatchCounter++;
    }
  }

  // Deselect everything
  doc.selection = false;

  // Alerts
  if (deletedSwatchCounter > 0) {
    alert(deletedSwatchCounter + " Swatch" + (deletedSwatchCounter > 1 ? "es" : "") + " and their paths deleted.");
  } else {
    alert(deletedSwatchCounter + " Swatches deleted." + "\n" + "Proceed.");
  }
}

// Run
try {
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "RTF_Template") {
    RTF_Delete_CMYK_UnusedSwatch_FromNoSwatch();
  } else {
    throw new Error("RTF Template File Not Active");
  }
} catch (e) {
  alert(e, "Script Alert", true);
}

//*******************
// Helper functions
//*******************

function getAllChildren(obj) {
  var childArray = new Array();
  for (var i = 0; i < obj.pageItems.length; i++) {
    childArray.push(obj.pageItems[i]);
  }
  return childArray;
}

function addPathsToStorage(obj, storageArray) {
  var elements = getAllChildren(obj);
  if (elements.length < 1) {
    return;
  } else {
    for (var i = 0; i < elements.length; i++) {
      try {
        switch (elements[i].typename) {
          case "PathItem":
            storageArray.push(elements[i]);
            break;
          case "GroupItem":
            addPathsToStorage(elements[i]);
            break;
          case "CompoundPathItem":
            var _pathItems = elements[i].pathItems;
            for (var j = 0; j < _pathItems.length; j++) {
              storageArray.push(_pathItems[j]);
            }
            break;
          default:
            throw new Error("Non-Path Elements Found");
        }
      } catch (e) {}
    }
  }
}
