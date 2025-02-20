function RTF_Group_TransferArtColors() {
  // Active Document
  var doc = app.activeDocument;

  // Swatches in Active Document
  var docSpots = doc.spots;

  // Layers in document
  var docLayers = doc.layers;

  // Transfer Art Layer
  var artLayer = doc.layers.getByName("Transfer Art");
  var _pathItems = artLayer.pathItems;
  var _compoundPaths = artLayer.compoundPathItems;

  // Storage for paths and compound paths
  var pathStorage = new Array();
  var compoundStorage = new Array();

  // Lock all layers except Transfer Art layer
  for (var i = 0; i < docLayers.length; i++) {
    if (docLayers[i].name !== "Transfer Art") {
      docLayers[i].locked = true;
    }
  }

  // Add paths & compound paths to storage
  for (var i = 0; i < _pathItems.length; i++) {
    pathStorage.push(_pathItems[i]);
  }

  for (var i = 0; i < _compoundPaths.length; i++) {
    compoundStorage.push(_compoundPaths[i]);
  }

  // Loop over Spots
  for (var i = docSpots.length; i--; ) {
    if (docSpots[i].name !== "[Registration]") {
      var currentColor = docSpots[i];
      var newColorGroup = artLayer.groupItems.add();
      newColorGroup.name = currentColor.name;

      // Loop over pathStorage
      for (var j = 0; j < pathStorage.length; j++) {
        // Match path fill to current spot. Returns -1 if not found
        var matchPathIndex = pathStorage[j].fillColor.spot.name.indexOf(currentColor.name);

        // Add path to newColorGroup
        if (matchPathIndex !== -1) {
          pathStorage[j].move(newColorGroup, ElementPlacement.PLACEATEND);
        }
      }

      // Loop over compoundStorage
      for (var k = 0; k < compoundStorage.length; k++) {
        // Path items in individual compound path
        var compPaths = compoundStorage[k].pathItems;

        // Loop over compPaths
        for (var l = 0; l < compPaths.length; l++) {
          // Match path fill to current spot. Returns -1 if not found
          var matchCompIndex = compPaths[l].fillColor.spot.name.indexOf(currentColor.name);

          // Add compound path to newColorGroup
          if (matchCompIndex !== -1) {
            compoundStorage[k].move(newColorGroup, ElementPlacement.PLACEATEND);
          }
        }
      }
    }
  }
}

// Run
try {
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "RTF_Template") {
    RTF_Group_TransferArtColors();
  } else {
    throw new Error("RTF Template File Not Active");
  }
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
}
