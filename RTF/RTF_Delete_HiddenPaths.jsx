function RTF_Delete_HiddenPaths() {
  // Active Document
  var doc = app.activeDocument;

  // Layers in document
  var docLayers = doc.layers;

  // Target Transfer Art layer
  var artLayer = doc.layers.getByName("Transfer Art");

  // Storage array for all path items
  var pathsArray = new Array();

  // Counter
  var hiddenCounter = 0;

  // Lock all layers except Transfer Art layer
  for (var i = 0; i < docLayers.length; i++) {
    if (docLayers[i].name !== artLayer.name) {
      docLayers[i].locked = true;
    }
  }

  // Deselect everything
  doc.selection = false;

  // Add all path items to pathsArray
  addPathsToStorage(artLayer, pathsArray);

  // Remove hidden paths
  for (var i = 0; i < pathsArray.length; i++) {
    if (pathsArray[i].hidden) {
      hiddenCounter++;
      pathsArray[i].remove();
    }
  }

  // Alert
  alert(hiddenCounter + " hidden path" + (hiddenCounter === 0 || hiddenCounter > 1 ? "s" : "") + " deleted.");
}

// Run
try {
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "RTF_Template") {
    RTF_Delete_HiddenPaths();
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
