//@include '../UTILITIES/Layers.jsx';
//@include '../UTILITIES/UB.jsx';

function SP_Generate_UB() {
  // Active Document
  var doc = app.activeDocument;
  var docLayers = doc.layers;

  // If Art layer try to select, else alert & exit if no selection
  selectArtLayer();

  // Original Active Layer
  var originLayer = doc.activeLayer;

  // Move copy to UB layer
  if (isLayerNamed("UB")) {
    var ubLayer = docLayers.getByName("UB");

    if (ubLayer.pageItems.length > 0) {
      // GUI Conflict Window
      var gui = createWindow("UB LAYER CONFLICT", 300);
      gui.margins = 15;
      var guiHeader = createStaticText(gui, "UB Layer contains art.");
      var guiInstruction = createStaticText(gui, "Delete UB & Replace with new UB?");

      // Button Group
      var buttonGroup = createGroup(gui, "row", "fill");
      var cancelButton = createButton(buttonGroup, "CANCEL", function () {
        gui.close();
      });
      var okButton = createButton(buttonGroup, "OK", function () {
        ubLayer.pageItems.removeAll();
        createUB(ubLayer);
        gui.close();
      });

      // Show GUI
      gui.show();
    } else {
      createUB(ubLayer);
    }
  } else {
    var ubNewLayer = createNewLayerUB("UB");
    createUB(ubNewLayer);
  }

  // Set active layer to original
  doc.activeLayer = originLayer;
}

// Run
try {
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "SP_Template") {
    addSwatchUB();
    SP_Generate_UB();
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
