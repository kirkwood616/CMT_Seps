function SP_Generate_UB() {
  // Active Document
  var doc = app.activeDocument;

  // Swatches in document
  var docSwatches = doc.swatches;

  // Layers in document
  var docLayers = doc.layers;

  // Selection
  var sel = doc.selection[0];

  // Alert & exit if no selection
  if (!sel) {
    alert("No Selected Artwork" + "\n" + "Select artwork to generate UB.");
    return;
  }

  // If selection isn't 1 item or 1 group, create group
  if (doc.selection.length > 1) {
    app.executeMenuCommand("group");
    sel = doc.selection[0];
  }

  // Move copy to UB layer
  if (isLayerNamed("UB", docLayers)) {
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
        createUB(ubLayer, docSwatches, doc);
        gui.close();
      });

      // Show GUI
      gui.show();
    } else {
      createUB(ubLayer, docSwatches, doc);
    }
  } else {
    var ubNewLayer = createNewLayerUB("UB", docLayers);
    createUB(ubNewLayer, docSwatches, doc);
  }
}

// Run
try {
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "SP_Template") {
    SP_Generate_UB();
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

/**
 * Creates a new named layer and sends to back.
 * @param {String} name Name of new layer
 * @param {Layers} layers Layers in document
 * @returns {Layer}
 */
function createNewLayerUB(name, layers) {
  var newLayerUB = layers.add();
  newLayerUB.name = name;
  newLayerUB.zOrder(ZOrderMethod.SENDTOBACK);
  return newLayerUB;
}

/**
 * Creates a UB from the current selection, colors it to the first WHITE UB swatch found, and moves it to a specific layer.
 * @param {Layer} layer The Layer to move UB to
 * @param {Swatches} swatches Swatches in the current document
 * @param {Document} document Current document
 */
function createUB(layer, swatches, document) {
  app.executeMenuCommand("copy");
  document.selection = false;
  app.executeMenuCommand("pasteFront");
  app.executeMenuCommand("compoundPath");
  app.executeMenuCommand("group");
  app.executeMenuCommand("Live Pathfinder Add");
  app.executeMenuCommand("expandStyle");
  document.selection[0].move(layer, ElementPlacement.PLACEATEND);

  for (var i = 0; i < swatches.length; i++) {
    var currentSwatch = swatches[i];
    var indexNameMatch = currentSwatch.name.indexOf("WHITE UB");

    if (indexNameMatch !== -1) {
      document.defaultFillColor = currentSwatch.color;
      break;
    }
  }

  defaultStroke(document);
  document.selection = false;
}

/**
 * Adds a stroke & sets it's width on the selection to Process White.
 * @param {Document} document Current document
 */
function defaultStroke(document) {
  var strokeColor = new CMYKColor();
  strokeColor.cyan = 0;
  strokeColor.magenta = 0;
  strokeColor.yellow = 0;
  strokeColor.black = 0;

  document.defaultStrokeColor = strokeColor;
  document.defaultStrokeWidth = 0.4;
}
