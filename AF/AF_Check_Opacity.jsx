function AF_Check_Opacity() {
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

  // Storage array for all path items
  var pathsArray = new Array();

  // Opacity seleted counter;
  var opacityCounter = 0;

  // Layer selected art is on
  var layerArt = doc.activeLayer;

  // Add all path items to pathsArray
  addPathsToStorage(layerArt, pathsArray);

  // Deselect everything
  doc.selection = false;

  // Find & select Paths with less than 100% opacity
  for (var i = 0; i < pathsArray.length; i++) {
    var currentPath = pathsArray[i];

    if (currentPath.opacity < 100) {
      currentPath.selected = true;
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
    layerArt.hasSelectedArtwork = true;

    if (doc.artboards[0].name.indexOf("RTF") === -1) {
      app.executeMenuCommand("group");
    }

    alert(opacityCounter + " items with less than 100% Opacity found." + "\n" + "Proceed.");
  }
}

// Run
try {
  if (app.documents.length > 0) {
    AF_Check_Opacity();
  } else {
    throw new Error("File Not Active");
  }
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
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
