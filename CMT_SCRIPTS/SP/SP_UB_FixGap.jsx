//@include '../UTILITIES/Layers.jsx';
//@include '../UTILITIES/UB.jsx';

// *****************************
// USER INPUT WINDOW
// *****************************
function SP_UB_FixGap_InputWindow() {
  // Exit if no selection
  if (app.activeDocument.selection.length < 1) throw new Error("No Selection");

  // Exported Value
  var userValue;

  // GUI
  // ===
  var gui = new Window("dialog");
  gui.text = "Fix UB Gaps";
  gui.preferredSize.width = 350;
  gui.orientation = "column";
  gui.alignChildren = ["center", "top"];
  gui.spacing = 10;
  gui.margins = 16;

  // INPUT GROUP
  // ======
  var inputGroup = gui.add("group", undefined, { name: "inputGroup" });
  inputGroup.orientation = "row";
  inputGroup.alignChildren = ["left", "center"];
  inputGroup.spacing = 10;
  inputGroup.margins = 0;

  var STATIC_strokeInput = inputGroup.add("statictext", undefined, undefined, {
    name: "STATIC_strokeInput",
  });
  STATIC_strokeInput.text = "Stroke Value:";

  var strokeValue = inputGroup.add(
    'edittext {justify: "center", properties: {name: "strokeValue"}}',
  );
  strokeValue.text = "0.2";
  strokeValue.preferredSize.width = 75;
  strokeValue.onChanging = function () {
    if (isNaN(this.text)) {
      alert("Only Numeric Values Allowed");
      this.text = "0.2";
    }
  };

  var upButton = inputGroup.add("button", undefined, undefined, {
    name: "upButton",
  });
  upButton.helpTip = "Increments of .05";
  upButton.text = "↑";
  upButton.preferredSize.width = 40;
  upButton.onClick = function () {
    if (isNaN(parseFloat(strokeValue.text))) {
      strokeValue.text = "0.2";
    } else {
      strokeValue.text = String(parseFloat(strokeValue.text) + 0.05);
    }
  };

  var downButton = inputGroup.add("button", undefined, undefined, {
    name: "downButton",
  });
  downButton.helpTip = "Decrements of .05";
  downButton.text = "↓";
  downButton.preferredSize.width = 40;
  downButton.onClick = function () {
    if (isNaN(parseFloat(strokeValue.text))) {
      strokeValue.text = "0.2";
    } else {
      strokeValue.text = String(parseFloat(strokeValue.text) - 0.05);
    }
  };

  // MESSAGE GROUP
  // ======
  var messageGroup = gui.add("group", undefined, { name: "messageGroup" });
  messageGroup.orientation = "row";
  messageGroup.alignChildren = ["left", "center"];
  messageGroup.spacing = 10;
  messageGroup.margins = 0;

  var STATIC_message = messageGroup.add("statictext", undefined, undefined, {
    name: "STATIC_message",
  });
  STATIC_message.text = "** Press 'Undo' twice (if needed) after execution **";

  // BUTTON GROUP
  // ===========
  var buttonGroup = gui.add("group", undefined, { name: "buttonGroup" });
  buttonGroup.orientation = "row";
  buttonGroup.alignChildren = ["left", "center"];
  buttonGroup.spacing = 10;
  buttonGroup.margins = 0;

  var cancelButton = buttonGroup.add("button", undefined, "CANCEL", {
    name: "cancel",
  });
  cancelButton.onClick = function () {
    userValue = "EXIT";
    gui.close();
  };

  var okButton = buttonGroup.add("button", undefined, "OK", { name: "ok" });
  okButton.onClick = function () {
    userValue = parseFloat(strokeValue.text);

    if (userValue <= 0) {
      alert("Value must be greater than 0.");
    }

    if (isNaN(userValue)) {
      alert("Value must be a number.");
    }

    if (!isNaN(userValue) && userValue > 0) {
      gui.close();
    }
  };

  // Show Window
  gui.show();

  return userValue;
}

// *****************************
// EXECUTION LOGIC
// *****************************
function SP_UB_FixGap(USER_VALUE) {
  // Exit if input window canceled
  if (USER_VALUE === "EXIT") return;

  // Active Document
  var doc = app.activeDocument;
  var docLayers = doc.layers;

  // Selection
  var sel = doc.selection;

  // Exit if no selection
  if (sel.length < 1) throw new Error("No Selection");

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

  // Get fill color
  var currColor = doc.swatches.getByName(doc.defaultFillColor.spot.name);

  // Stroke it
  doc.defaultStrokeColor = currColor.color;
  doc.defaultStrokeWidth = 0.2;

  // Expand it
  app.executeMenuCommand("OffsetPath v22");
  app.executeMenuCommand("Live Pathfinder Add");
  app.executeMenuCommand("expandStyle");

  // Recolor the stroke
  var strokeColor = new CMYKColor();
  strokeColor.cyan = 0;
  strokeColor.magenta = 0;
  strokeColor.yellow = 0;
  strokeColor.black = 0;

  doc.defaultStrokeColor = strokeColor;
  doc.defaultStrokeWidth = USER_VALUE;

  // Outline stroke & trim
  app.executeMenuCommand("OffsetPath v22");
  app.executeMenuCommand("Live Pathfinder Trim");

  // Deselect, get the fill & cut
  doc.selection = null;
  doc.defaultFillColor = currColor.color;
  app.executeMenuCommand("Find Fill Color menu item");
  app.redraw();
  app.cut();

  // Delete remnants
  app.executeMenuCommand("selectall");
  app.executeMenuCommand("clear");

  // Paste it, overprint fill it, stroke it
  app.executeMenuCommand("pasteInPlace");
  app.executeMenuCommand("selectall");
  app.executeMenuCommand("group");
  originLayer.hasSelectedArtwork = true;
  //@include '../UTILITIES/Overprint_Fill_True.jsx';
  doc.defaultStrokeColor = strokeColor;
  doc.defaultStrokeWidth = 0.4;

  // Deselect everything
  doc.selection = null;

  // Restore original layer visibility
  restoreVisibleLayers(visibleLayers);
}

// *****************************
// RUN
// *****************************
try {
  if (
    app.documents.length > 0 &&
    app.activeDocument.artboards[0].name === "SP_Template"
  ) {
    var userInputValue = SP_UB_FixGap_InputWindow();
    SP_UB_FixGap(userInputValue);
  } else {
    throw new Error("SP Template File Not Active");
  }
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
}
