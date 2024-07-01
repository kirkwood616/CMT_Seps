function AF_Delete_NoColorPaths() {
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

  // Counter
  var noColorCounter = deleteNoColorPaths(sel);

  // Group remaining art
  if (doc.artboards[0].name.indexOf("RTF") === -1) {
    app.executeMenuCommand("group");
  }

  // Alert
  alert(noColorCounter + " No Color path" + (noColorCounter === 0 || noColorCounter > 1 ? "s" : "") + " deleted.");
}

// Run
try {
  if (app.documents.length > 0) {
    AF_Delete_NoColorPaths();
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

/**
 * Deletes all no color paths in a selection.
 * @param {*} selection Current selection
 * @param {Number} [counter] Counter variable for tracking deleted paths
 * @returns {Number} Number of deleted paths
 */
function deleteNoColorPaths(selection, counter) {
  var deletedCounter = 0;

  if (selection.length < 1) {
    return;
  } else {
    for (var i = 0; i < selection.length; i++) {
      switch (selection[i].typename) {
        case "PathItem":
          if (selection[i].fillColor.typename === "NoColor") {
            selection[i].remove();
            deletedCounter++;
          }
          break;
        case "GroupItem":
        case "CompoundPathItem":
          deleteNoColorPaths(selection[i], deletedCounter);
          break;
      }
    }
    return deletedCounter;
  }
}
