function RTF_Delete_NoColorPaths() {
  // Active Document
  var doc = app.activeDocument;

  // Layers in document
  var docLayers = doc.layers;

  // Transfer Art layer
  var artLayer = doc.layers.getByName("Transfer Art");

  // Storage array for all path items
  var pathsArray = new Array();

  // Counter
  var noColorCounter = 0;

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

  // Delete NoColor paths
  for (var i = 0; i < pathsArray.length; i++) {
    if (pathsArray[i].fillColor.typename === "NoColor") {
      noColorCounter++;
      pathsArray[i].remove();
    }
  }
}

// Run
try {
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "RTF_Template") {
    RTF_Delete_NoColorPaths();
  } else {
    throw new Error("RTF Template File Not Active");
  }
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
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
