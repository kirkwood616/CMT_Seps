//@include '../UTILITIES/Layers.jsx';
//@include '../UTILITIES/UB.jsx';

function SP_Generate_UB_SelectColors() {
  // Active Document
  var doc = app.activeDocument;
  var docSwatches = doc.swatches;
  var docLayers = doc.layers;

  // If Art layer try to select, else alert & exit if no selection
  selectArtLayer();

  // Selection
  var sel = doc.selection;

  // Original Active Layer
  var originLayer = doc.activeLayer;

  // Overprint selected art
  //@include '../UTILITIES/Overprint_Fill_True.jsx';

  // Ungroup artwork
  if (sel.length > 0) {
    for (var i = 0; i < sel.length; i++) {
      ungroup(sel[i]);
    }
  }

  // Storage array
  var pathsArray = new Array();

  // Add selection's paths to storage for select window
  addPathsToStorage(originLayer, pathsArray);

  // GUI window
  var gui = createWindow("SELECT COLORS FOR UB", 300);
  var colorPanel = createPanel(gui, "Select Colors");
  var checkboxGroup = createGroup(colorPanel, "column", "left");
  checkboxGroup.margins = 15;

  // Create checkboxes
  for (var i = 0; i < docSwatches.length; i++) {
    var swatchName = docSwatches[i].name;

    // Generate checkboxes from colors in selection (pathsArray)
    for (var j = 0; j < pathsArray.length; j++) {
      if (pathsArray[j].fillColor.spot.name === swatchName) {
        var swatchCheckbox = createCheckbox(checkboxGroup, swatchName, true);
        break;
      }
    }
  }

  // Buttons
  var buttonGroup = createGroup(gui, "row");
  var cancelButton = createButton(buttonGroup, "CANCEL", function () {
    gui.close();
  });
  var okButton = createButton(buttonGroup, "OK", function () {
    // Storage
    var checkedColorNames = new Array();
    var uncheckedColorNames = new Array();

    // Add checked color names to storage
    for (var i = 0; i < checkboxGroup.children.length; i++) {
      if (checkboxGroup.children[i].value) {
        checkedColorNames.push(checkboxGroup.children[i].text);
      } else {
        uncheckedColorNames.push(checkboxGroup.children[i].text);
      }
    }

    // Alert if no selection
    if (!checkedColorNames.length) {
      alert("No Colors Selected");
      return;
    }

    // Add temp layer
    var tempLayer = docLayers.add();
    tempLayer.name = "TEMP";

    // Duplicate selection, move to temp layer, deselect & hide art layer
    app.executeMenuCommand("group");
    app.executeMenuCommand("copy");
    app.executeMenuCommand("pasteFront");
    doc.selection[0].move(tempLayer, ElementPlacement.PLACEATBEGINNING);

    // Reset sel to current selection & ungroup artwork
    sel = doc.selection;
    if (sel.length > 0) {
      for (var i = 0; i < sel.length; i++) {
        ungroup(sel[i]);
      }
    }

    // Paths & storage for tempLayer
    var tempPathItems = tempLayer.pathItems;
    var tempCompoundItems = tempLayer.compoundPathItems;
    var tempStorage = new Array();

    // Deselect everything
    doc.selection = false;

    // Loop unchecked colors to delete
    for (var i = 0; i < uncheckedColorNames.length; i++) {
      var uncheckedColor;

      try {
        uncheckedColor = docSwatches.getByName(uncheckedColorNames[i]);
      } catch (e) {
        alert(
          "No Swatch Name Match" + "\n" + "UB will have errors.",
          "ERROR",
          true
        );
      }

      // Loop temp PathItems & add to tempStorage
      for (var j = 0; j < tempPathItems.length; j++) {
        if (tempPathItems[j].fillColor.spot.name === uncheckedColor.name) {
          tempStorage.push(tempPathItems[j]);
        }
      }

      // Loop temp CompoundPathItems
      for (var k = 0; k < tempCompoundItems.length; k++) {
        var currentCompoundPaths = tempCompoundItems[k].pathItems;
        // Loop PathItems in Compound for color match
        for (var l = 0; l < currentCompoundPaths.length; l++) {
          var currentPath = currentCompoundPaths[l];
          // Add CompoundPathItem to tempStorage if match
          if (currentPath.fillColor.spot.name === uncheckedColor.name) {
            tempStorage.push(tempCompoundItems[k]);
          }
        }
      }
    }

    // Select all items in tempStorage, delete & deselect everything
    for (var i = tempStorage.length; i--; ) {
      tempStorage[i].selected = true;
    }
    app.cut();
    doc.selection = false;

    // Select temp layer art
    tempLayer.hasSelectedArtwork = true;

    // If selection isn't 1 item or 1 group, create group & reset sel
    if (doc.selection.length > 1) {
      app.executeMenuCommand("group");
      sel = doc.selection[0];
    }

    // Move copy to UB layer
    if (isLayerNamed("UB")) {
      var ubLayer = docLayers.getByName("UB");
      ubLayer.visible = true;

      if (ubLayer.pageItems.length > 0) {
        // Conflict Window
        var conflictWindow = createWindow("UB LAYER CONFLICT", 300);
        conflictWindow.margins = 15;
        var conflictHeader = createStaticText(
          conflictWindow,
          "UB Layer contains art."
        );
        var conflictInstruction = createStaticText(
          conflictWindow,
          "Delete UB & Replace with new UB?"
        );

        // Conflict Button Group
        var conflictButtonGroup = createGroup(conflictWindow, "row", "fill");
        var conflictCancelButton = createButton(
          conflictButtonGroup,
          "CANCEL",
          function () {
            conflictWindow.close();
          }
        );
        var conflictOkButton = createButton(
          conflictButtonGroup,
          "OK",
          function () {
            ubLayer.pageItems.removeAll();
            createSelectedUB(ubLayer);
            conflictWindow.close();
          }
        );

        // Show Conflict Window
        conflictWindow.show();
      } else {
        createSelectedUB(ubLayer);
      }
    } else {
      var ubNewLayer = createNewLayerUB("UB");
      createSelectedUB(ubNewLayer);
    }

    // Delete temp layer
    tempLayer.remove();

    // Set active layer to original
    doc.activeLayer = originLayer;

    // Close main window
    gui.close();
  });

  // Show GUI
  gui.show();
}

// Run
try {
  if (
    app.documents.length > 0 &&
    app.activeDocument.artboards[0].name === "SP_Template"
  ) {
    addSwatchUB();
    SP_Generate_UB_SelectColors();
  } else {
    throw new Error("SP Template File Not Active");
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
    if (
      object.pageItems[0].typename == "GroupItem" &&
      !object.pageItems[0].clipped
    ) {
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
 * Creates a GUI dialog window.
 * @param {String} title String to appear in window's top bar
 * @param {Number} width Width of window
 * @returns {Window}
 */
function createWindow(title, width) {
  var window = new Window("dialog", title);
  window.orientation = "column";
  window.preferredSize.width = width;
  return window;
}

/**
 * Creates a panel item.
 * @param {Window|Group} parent Where to add panel into
 * @param {String} [title] Text for panel's upper-left title
 * @returns {Panel}
 */
function createPanel(parent, title) {
  var panel = parent.add("panel", undefined, title);
  panel.orientation = "row";
  return panel;
}

/**
 * Creates a static text item.
 * @param {Window|Group|Panel} parent Where to add statictext into
 * @param {String} text Text contents
 * @returns {StaticText}
 */
function createStaticText(parent, text) {
  var staticText = parent.add("statictext", undefined, text);
  return staticText;
}

/**
 * Creates a group item.
 * @param {Window|Group|Panel} parent Where to add group into
 * @param {String} orientation Orientation of the group
 * @param {String} align Alignment of group's children
 * @returns {Group}
 */
function createGroup(parent, orientation, align) {
  var group = parent.add("group");
  group.orientation = orientation;
  group.alignChildren = align;
  return group;
}

/**
 * Creates a checkbox item with text. Can specify if box is checked or unchecked.
 * @param {Window|Group|Panel} parent Where to add checbox into
 * @param {String} text Text to appear next to checkbox
 * @param {Boolean} value true for checked, false for unchecked
 * @returns {Checkbox}
 */
function createCheckbox(parent, text, value) {
  var checkbox = parent.add("checkbox", undefined, text);
  checkbox.value = value;
  return checkbox;
}

/**
 * Creates a clickable button.
 * @param {Window|Group|Panel} parent Where to add button into
 * @param {String} title Text to be shown inside of button
 * @param {() => void} onClick Callback function to run when button is clicked
 * @returns {Button}
 */
function createButton(parent, title, onClick) {
  var button = parent.add("button", undefined, title);
  if (onClick !== undefined) button.onClick = onClick;
  return button;
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
