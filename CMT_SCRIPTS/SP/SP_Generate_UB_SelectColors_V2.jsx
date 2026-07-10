//@include '../UTILITIES/Layers.jsx';
//@include '../UTILITIES/Colors.jsx';
//@include '../UTILITIES/UB.jsx';
//@include '../UTILITIES/Artboards.jsx';

function SP_Generate_UB_SelectColors_V2() {
  // Active Document
  var doc = app.activeDocument;
  var docSwatches = doc.swatches;
  var docLayers = doc.layers;

  // If Art layer try to select, else alert & exit if no selection
  selectArtLayer();

  // Selection
  var sel = doc.selection;

  // Overprint selected art
  //@include '../UTILITIES/Overprint_Fill_True.jsx';

  // Get the layer that the selection is on & set to active layer
  if (sel.length > 0) {
    var selItem = sel[0];
    var selLayer = selItem.layer.name;
    doc.activeLayer = doc.layers.getByName(selLayer);
  }

  // Original Active Layer
  var originLayer = doc.activeLayer;

  // Store visibility states of layers
  var visibleLayers = storeLayerVisibility();

  // Turn off visibility of all layers except for active
  for (var i = 0; i < docLayers.length; i++) {
    if (docLayers[i].name !== originLayer.name) {
      docLayers[i].visible = false;
    }
  }

  // Temporary Artboard (get enabled inks hack)
  var newArtboard = addInchArtboard();

  // Get enabled ink names from visible layer
  var enabledInks = storeEnabledInkNames();

  // Delete temporory Artboard
  newArtboard.remove();

  // GUI window
  var gui = createWindow("SELECT COLORS FOR UB", 300);
  var colorPanel = createPanel(gui, "Select Colors");
  var checkboxGroup = createGroup(colorPanel, "column", "left");
  checkboxGroup.margins = 15;

  // Create checkboxes from enabled inks & alert if process inks detected
  var processInksFound = false;

  for (var i = 0; i < enabledInks.length; i++) {
    var swatchName = enabledInks[i];

    switch (swatchName) {
      case "Process Cyan":
      case "Process Magenta":
      case "Process Yellow":
      case "Process Black":
        if (processInksFound) break;
        processInksFound = true;
        alert(
          "PROCESS INKS FOUND" + "\n\n" + "Non-Spot Colors Detected.",
          "Script Alert",
          true,
        );
        break;

      default:
        var swatchCheckbox = createCheckbox(checkboxGroup, swatchName, true);
        break;
    }
  }

  // Buttons
  var buttonGroup = createGroup(gui, "row");
  var cancelButton = createButton(buttonGroup, "CANCEL", function () {
    restoreVisibleLayers(visibleLayers);
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
    doc.selection = null;
    doc.activeLayer = tempLayer;
    app.executeMenuCommand("pasteInPlace");

    // Make origin layer not visible
    originLayer.visible = false;

    // Deselect everything
    doc.selection = null;

    // Loop unchecked colors to delete
    for (var i = 0; i < uncheckedColorNames.length; i++) {
      var uncheckedColor;
      try {
        uncheckedColor = docSwatches.getByName(uncheckedColorNames[i]);
      } catch (e) {
        alert(
          "No Swatch Name Match" + "\n" + "UB will have errors.",
          "ERROR",
          true,
        );
      }
      doc.defaultFillColor = uncheckedColor.color;
      app.executeMenuCommand("Find Fill Color menu item");
      app.cut();
      doc.selection = null;
    }

    // Restore layer visibility
    restoreVisibleLayers(visibleLayers);

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
          "UB Layer contains art.",
        );
        var conflictInstruction = createStaticText(
          conflictWindow,
          "Delete UB & Replace with new UB?",
        );

        // Conflict Button Group
        var conflictButtonGroup = createGroup(conflictWindow, "row", "fill");
        var conflictCancelButton = createButton(
          conflictButtonGroup,
          "CANCEL",
          function () {
            conflictWindow.close();
          },
        );
        var conflictOkButton = createButton(
          conflictButtonGroup,
          "OK",
          function () {
            ubLayer.pageItems.removeAll();
            createSelectedUB(ubLayer);
            conflictWindow.close();
          },
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
    SP_Generate_UB_SelectColors_V2();
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
