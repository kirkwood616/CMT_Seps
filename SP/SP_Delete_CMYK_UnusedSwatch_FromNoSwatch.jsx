function SP_Delete_CMYK_UnusedSwatch_FromNoSwatch() {
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

  // Spots & Swatches
  var docSwatches = doc.swatches;

  // Storage array for all path items
  var pathsArray = new Array();

  // Counter
  var deletedSwatchCounter = 0;

  // Layer selected art is on
  var layerArt = doc.activeLayer;

  // Add all path items to pathsArray
  addPathsToStorage(layerArt, pathsArray);

  // Deselect everything
  doc.selection = false;

  // Remove PROCESS COLOR swatches
  for (var i = docSwatches.length; i--; ) {
    var processMatchIndex = docSwatches[i].name.indexOf("PROCESS COLOR");
    if (processMatchIndex !== -1) {
      docSwatches[i].remove();
      deletedSwatchCounter++;
    }
  }

  // Remove CMYK color paths
  for (var i = 0; i < pathsArray.length; i++) {
    if (pathsArray[i].fillColor.typename === "CMYKColor") {
      pathsArray[i].remove();
    }
  }

  // Select, group & deselect original selection
  layerArt.hasSelectedArtwork = true;
  app.executeMenuCommand("group");

  // Alerts
  if (deletedSwatchCounter > 0) {
    alert(deletedSwatchCounter + " Swatch" + (deletedSwatchCounter > 1 ? "es" : "") + " and their items deleted.");
  } else {
    alert(deletedSwatchCounter + " Swatches deleted." + "\n" + "Proceed.");
  }
}

// Run
try {
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "SP_Template") {
    SP_Delete_CMYK_UnusedSwatch_FromNoSwatch();
  } else {
    throw new Error("SP Template File Not Active");
  }
} catch (e) {
  alert(e + "\n" + e.line, "Script Alert", true);
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
