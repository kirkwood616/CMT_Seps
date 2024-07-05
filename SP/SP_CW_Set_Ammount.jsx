function SP_CW_Set_Ammount() {
  // Active Document
  var doc = app.activeDocument;

  // Current Selection
  var sel = doc.selection;

  // Exit if no selection
  if (!sel.length) {
    throw new Error("No Selected Art" + "\n" + "Select Art Before Running.");
  }

  // Overprint Fill selection
  #include 'Overprint_Fill_True.jsx';

  // Current layer (will be CW_1)
  var artLayer = doc.activeLayer;

  // GUI Window
  var amountWindow = createWindow("SET # OF COLORWAYS");

  // Panel
  var selectPanel = createPanel(amountWindow, "Select CW Amount");
  selectPanel.alignment = "centered";

  // List
  var numberDropdown = createDropdown(selectPanel, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  numberDropdown.selection = 1;

  // Button Control Group
  var buttonGroup = createGroup(amountWindow, "row");
  buttonGroup.alignChildren = "fill";

  // Cancel Button
  var cancelButton = createButton(buttonGroup, "CANCEL", function () {
    amountWindow.close();
  });

  // OK Button
  var okButton = createButton(buttonGroup, "OK", function () {
    // # of CW's selected
    var numberSelection = parseInt(numberDropdown.selection.text);

    if (numberSelection === 1) {
      if (isLayerNamed("CW_1", doc.layers)) {
        var artLayerCW_1 = doc.layers.getByName("CW_1");
        artLayerCW_1.name = "Art";

        for (var i = 0; i < doc.layers.length; i++) {
          if (doc.layers[i].name.indexOf("CW_") !== -1) {
            doc.layers[i].remove();
          }
        }
      }

      amountWindow.close();
      return;
    }

    // Rename current layer "CW_1"
    artLayer.name = "CW_1";

    // Index of CW_1
    var indexCW_1;

    for (var i = 0; i < doc.layers.length; i++) {
      if (doc.layers[i].name === artLayer.name) {
        indexCW_1 = i;
        break;
      }
    }

    // Duplicate CW_1 layer, position & rename to it's respective number
    for (var i = 1; i < numberSelection; i++) {
      var newLayer = doc.layers.add();
      newLayer.name = "CW_" + (i + 1).toString();
      newLayer.zOrder(ZOrderMethod.SENDTOBACK);

      for (var j = 1; j < indexCW_1; j++) {
        newLayer.zOrder(ZOrderMethod.BRINGFORWARD);
      }

      app.copy();
      app.executeMenuCommand("pasteFront");
      sel = doc.selection[0];
      sel.move(newLayer, ElementPlacement.PLACEATEND);
      indexCW_1++;
    }

    // De-select everything
    doc.selection = false;

    // Set CW_1 to active layer
    doc.activeLayer = artLayer;

    // Close Window
    amountWindow.close();
  });

  // Show window
  amountWindow.show();
}

// Run
try {
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "SP_Template") {
    SP_CW_Set_Ammount();
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
 * Creates a group item.
 * @param {Window|Group|Panel} parent Where to add group into
 * @param {String} orientation Orientation of the group
 * @param {String} [align] Alignment of group's children
 * @returns {Group}
 */
function createGroup(parent, orientation, align) {
  var group = parent.add("group");
  group.orientation = orientation;
  group.alignChildren = align;
  return group;
}

/**
 * Creates a panel item.
 * @param {Window|Group} parent Where to add panel into
 * @param {String} [title] Text for panel's upper-left title
 * @returns {Panel}
 */
function createPanel(parent, title) {
  var panel = parent.add("panel", undefined, title);
  panel.orientation = "column";
  return panel;
}

// Create Window Dropdown
function createDropdown(parent, list) {
  var dropdown = parent.add("dropdownlist", undefined, list);
  return dropdown;
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

function removeAllCW(layers) {
  var isCW_1 = false;

  for (var i = 0; i < layers.length; i++) {
    if (layers[i].name === "CW_1") {
      isCW_1 = true;
    } else {
      isCW_1 = false;
    }
  }

  if (isCW_1) {
    var artLayerCW_1 = layers.getByName("CW_1");
    artLayerCW_1.name = "Art";

    for (var i = 0; i < layers.length; i++) {
      if (layers[i].name.indexOf("CW_") !== -1) {
        layers[i].remove();
      }
    }
  }
}
