function SP_Delete_NoColorPaths() {
  // Active Document
  var doc = app.activeDocument;

  // Layers in document
  var docLayers = doc.layers;

  // Exit if no Art layer
  if (!isLayerNamed("Art", docLayers)) {
    throw new Error("No Layer named 'Art'" + "\n" + "Art to be scanned needs to be on a layer named 'Art'");
  }

  // Target Art layer
  var artLayer = docLayers.getByName("Art");

  // Exit if nothin on Art layer
  if (!artLayer.pageItems.length) {
    throw new Error("No art on 'Art' Layer" + "\n" + "Place art to be scanned on the layer named 'Art'");
  }

  // Lock all layers except Art layer
  for (var i = 0; i < docLayers.length; i++) {
    if (docLayers[i].name !== artLayer.name) {
      docLayers[i].locked = true;
    }
  }

  // Storage array for all path items
  var pathsArray = new Array();

  // Counter
  var noColorCounter = 0;

  // Lock all layers except Art layer
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

  // Unlock layers except Guides
  for (var i = 0; i < docLayers.length; i++) {
    if (docLayers[i].name !== "Guides") {
      docLayers[i].locked = false;
    }
  }

  // Alert
  alert(noColorCounter + " path" + (noColorCounter === 0 || noColorCounter > 1 ? "s" : "") + " deleted.");
}

// Run
try {
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "SP_Template") {
    SP_Delete_NoColorPaths();
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
