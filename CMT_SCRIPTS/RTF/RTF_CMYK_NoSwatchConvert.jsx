function RTF_CMYK_NoSwatchConvert() {
  // Active Document
  var doc = app.activeDocument;

  // Spots
  var docSpots = doc.spots;

  // Layers in document
  var docLayers = doc.layers;

  // Target Transfer Art layer
  var artLayer = doc.layers.getByName("Transfer Art");

  // Storage array for all path items
  var pathsArray = new Array();

  // Counter
  var cmykCounter = 0;

  // Deselect everything
  doc.selection = false;

  // Lock all layers except Transfer Art layer
  for (var i = 0; i < docLayers.length; i++) {
    if (docLayers[i].name !== artLayer.name) {
      docLayers[i].locked = true;
    }
  }

  // Add all path items to pathsArray
  addPathsToStorage(artLayer, pathsArray);

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
  if (cmykCounter > 0 && app.activeDocument.artboards[0].name === "RTF_Template") {
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
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "RTF_Template") {
    RTF_CMYK_NoSwatchConvert();
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
