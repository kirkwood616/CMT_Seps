function SP_Delete_HiddenPaths() {
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
  var hiddenCounter = deleteHiddenPaths(sel);

  // Group remaining art
  app.executeMenuCommand("group");

  // Alert
  alert(hiddenCounter + " hidden path" + (hiddenCounter === 0 || hiddenCounter > 1 ? "s" : "") + " deleted.");
}

// Run
try {
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "SP_Template") {
    SP_Delete_HiddenPaths();
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

/**
 * Deletes all hidden paths in a selection.
 * @param {*} selection Current selection
 * @param {Number} [counter] Counter variable for tracking deleted paths
 * @returns {Number} Number of deleted paths
 */
function deleteHiddenPaths(selection, counter) {
  var deletedCounter = 0;

  if (selection.length < 1) {
    return;
  } else {
    for (var i = 0; i < selection.length; i++) {
      switch (selection[i].typename) {
        case "PathItem":
          if (selection[i].hidden) {
            selection[i].remove();
            deletedCounter++;
          }
          break;
        case "GroupItem":
        case "CompoundPathItem":
          deleteHiddenPaths(selection[i], deletedCounter);
          break;
      }
    }
    return deletedCounter;
  }
}
