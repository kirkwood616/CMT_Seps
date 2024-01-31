function SP_CMYK_NoSwatchConvert() {
  // Active Document
  var doc = app.activeDocument;

  // Spots
  var docSpots = doc.spots;

  // Layers in document
  var docLayers = doc.layers;

  // // Exit if no Art layer
  // if (!isLayerNamed("Art", docLayers)) {
  //   throw new Error("No Layer named 'Art'" + "\n" + "Art to be scanned needs to be on a layer named 'Art'");
  // }

  // Art layer
  var artLayer = docLayers.getByName("Art");

  // // Exit if nothin on Art layer
  // if (!artLayer.pageItems.length) {
  //   throw new Error("No art on 'Art' Layer" + "\n" + "Place art to be scanned on the layer named 'Art'");
  // }

  // Metadata layer
  var metadataLayer = docLayers.getByName("Metadata");

  // Storage array for all path items
  var pathsArray = new Array();

  // Counter
  var cmykCounter = 0;

  // Unlock metadataLayer
  metadataLayer.locked = false;

  // Deselect everything
  doc.selection = false;

  // Add all path items to pathsArray
  addPathsToStorage(artLayer, pathsArray);
  $.writeln(pathsArray.length);

  // Loop through pathsArray and
  for (var i = 0; i < pathsArray.length; i++) {
    // Current Path
    var _pathItem = pathsArray[i];

    // Check if path is CMYK & perform conversion
    if (_pathItem.fillColor.typename === "CMYKColor") {
      // Add 1 to counter of found CMYK color
      cmykCounter++;

      // Copy of found CMYK color's values
      var processColor = new CMYKColor();
      processColor.cyan = _pathItem.fillColor.cyan;
      processColor.magenta = _pathItem.fillColor.magenta;
      processColor.yellow = _pathItem.fillColor.yellow;
      processColor.black = _pathItem.fillColor.black;

      // Add new Spot to palette w/ values
      var newSpot = docSpots.add();
      newSpot.name = "PROCESS COLOR " + cmykCounter;
      newSpot.colorType = ColorModel.SPOT;
      newSpot.color = processColor;

      // Declare new SpotColor and assign newSpot to value (only way this works)
      var newSpotColor = new SpotColor();
      newSpotColor.spot = newSpot;

      // Select path
      _pathItem.selected = true;

      // Select all paths colored with selected process color
      app.executeMenuCommand("Find Fill Color menu item");

      // Change all selected items' color to newSpotColor via default fill color
      doc.defaultFillColor = newSpotColor;

      // Deselect everything
      doc.selection = false;
    }
  }

  // Alerts
  if (cmykCounter > 0 && app.activeDocument.artboards[0].name === "SP_Template") {
    alert(
      cmykCounter +
        " CMYK color" +
        (cmykCounter > 1 ? "s" : "") +
        " without a swatch found." +
        "\n\n" +
        "Spot Swatches have been created for these colors." +
        "\n\n" +
        "Run the Delete Process Swatch Colors action or rename the swatches before proceeding."
    );
  } else {
    alert(cmykCounter + " CMYK colors without a swatch found.");
  }
}

// Run
try {
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "SP_Template") {
    SP_CMYK_NoSwatchConvert();
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
