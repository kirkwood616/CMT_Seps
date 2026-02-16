//@include '../UTILITIES/FormatText.jsx';

function DTF_Names_OrderArtPrompt() {
  // Active Document
  var doc = app.activeDocument;
  var artLayer = doc.layers[0];

  // Order & Art Numbers
  var orderNumber;
  var artNumber;

  // Assign order & art numbers
  var splitValues = splitOrderArtNamesDTF(artLayer.name);
  orderNumber = splitValues[0];
  artNumber = splitValues[1];

  // GUI Window
  var gui = new Window("dialog", "SET ORDER & ART NUMBER");
  gui.orientation = "column";
  gui.preferredSize.width = 300;

  // Order Panel
  var orderPanel = createPanel(gui, "Order Number");
  var orderInput = orderPanel.add("edittext", undefined, orderNumber);
  orderInput.active = true;

  // Art Panel
  var artPanel = createPanel(gui, "Art Number");
  var artInput = artPanel.add("edittext", undefined, artNumber);

  // Button Control Group
  var buttonGroup = createGroup(gui, "row");
  buttonGroup.alignChildren = "fill";

  // Cancel Button
  var cancelButton = createButton(buttonGroup, "CANCEL", function () {
    gui.close();
  });

  // OK Button
  var okButton = createButton(buttonGroup, "OK", function () {
    // Check for no input & alert
    if (!orderInput.text || !artInput.text) {
      alert("Missing Values" + "\n" + "Enter Values");
    }

    // Set layer name w/ file name & close window
    if (orderInput.text && artInput.text) {
      artLayer.name =
        artInput.text.toUpperCase() + "sc (DTF NAMES " + orderInput.text + ")";
      gui.close();
    }
  });

  // Show GUI
  gui.show();
}

// Run
try {
  if (
    app.documents.length > 0 &&
    app.activeDocument.artboards[0].name === "DTF_Template"
  ) {
    DTF_Names_OrderArtPrompt();
  } else {
    throw new Error("DTF Template Not Active");
  }
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
}

//*******************
// Helper functions
//*******************

// Create Window Panel
function createPanel(parent, title) {
  var panel = parent.add("panel", undefined, title);
  panel.orientation = "column";
  panel.alignChildren = "fill";
  panel.preferredSize.width = 250;
  return panel;
}

// Create Window Group
function createGroup(parent, orientation) {
  var group = parent.add("group");
  group.orientation = orientation;
  return group;
}

// Create Window Button
function createButton(parent, title, onClick) {
  var button = parent.add("button", undefined, title);
  if (onClick !== undefined) button.onClick = onClick;
  return button;
}
