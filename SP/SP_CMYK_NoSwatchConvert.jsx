function SP_CMYK_NoSwatchConvert() {
  // Active Document
  var doc = app.activeDocument;

  // Selection
  var sel = doc.selection;

  // Exit if no selection
  if (!sel.length) {
    throw new Error("No Selected Art" + "\n" + "Select Art Before Running.");
  }

  // Ungroup artwork
  if (sel.length > 0) {
    for (var i = 0; i < sel.length; i++) {
      ungroup(sel[i]);
    }
  }

  // Reset sel to ungrouped items
  sel = doc.selection;

  // Spots
  var docSpots = doc.spots;

  // Storage array for all path items
  var pathsArray = new Array();

  // Counter
  var cmykCounter = 0;

  // Layer selected art is on
  var layerArt = doc.activeLayer;

  // Deselect everything
  doc.selection = null;

  // Add all path items to pathsArray
  addPathsToStorage(layerArt, pathsArray);

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

      // Declare new SpotColor and assign newSpot to value
      var newSpotColor = new SpotColor();
      newSpotColor.spot = newSpot;

      // Select path
      _pathItem.selected = true;

      // Select all paths colored with selected process color
      app.executeMenuCommand("Find Fill Color menu item");

      // Change all selected items' color to newSpotColor via default fill color
      doc.defaultFillColor = newSpotColor;

      // Deselect everything
      doc.selection = null;
    }
  }

  // Select, group & deselect original selection
  doc.selection = sel;
  app.executeMenuCommand("group");
  doc.selection = null;

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
        "Run 'Delete Converted CMYK Swatches' or rename the swatches before proceeding."
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
 * Ungroup a groupItem within Adobe Illustrator. Similar to `Object > Ungroup`
 * @param {*} object    An Adobe Illustrator groupItem
 * @param {*} recursive Should nested groupItems also be ungrouped
 */
function ungroup(object, recursive) {
  if (object.typename != "GroupItem") {
    return;
  }
  recursive = typeof recursive !== "undefined" ? recursive : true;
  var subObject;
  while (object.pageItems.length > 0) {
    if (object.pageItems[0].typename == "GroupItem" && !object.pageItems[0].clipped) {
      subObject = object.pageItems[0];
      subObject.move(object, ElementPlacement.PLACEBEFORE);
      if (recursive) {
        ungroup(subObject, recursive);
      }
    } else {
      object.pageItems[0].move(object, ElementPlacement.PLACEBEFORE);
    }
  }
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
