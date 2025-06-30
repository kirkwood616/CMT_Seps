//@include '../UTILITIES/Polyfills.js';

function NTF_Set_OrderArt() {
  // Active Document
  var doc = app.activeDocument;

  // Target Metadata layer, Order & Art File text frames
  var metadataLayer = doc.layers.getByName("Metadata");
  var metaGroup = metadataLayer.groupItems.getByName("MetaGroup");
  var orderName = metaGroup.textFrames.getByName("_ORDER");
  var artName = metaGroup.textFrames.getByName("_ART FILE");

  // Remove leading text in Order & Art File text frames
  var orderNameText = orderName.contents.replace("ORDER ", "");
  var artNameText = artName.contents.replace("ART FILE: ", "");

  // Unlock Metadata layer
  metadataLayer.locked = false;

  // GUI Window
  var gui = new Window("dialog", "SET ORDER & ART NUMBER");
  gui.orientation = "column";
  gui.preferredSize.width = 300;

  // Order Panel
  var orderPanel = createPanel(gui, "Order Number");
  // Order Panel Input
  var orderInput = orderPanel.add("edittext", undefined, orderNameText);
  orderInput.active = true;

  // Art Panel
  var artPanel = createPanel(gui, "Art Number");
  // Art Panel Input
  var artInput = artPanel.add("edittext", undefined, artNameText);

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
      if (!orderInput.text && !artInput.text) {
        alert("No Numbers Entered" + "\n" + "Enter Numbers");
        orderInput.active = true;
      }

      if (!orderInput.text && artInput.text) {
        alert("No Order Number Entered" + "\n" + "Enter Order Number");
        orderInput.active = true;
      }

      if (orderInput.text && !artInput.text) {
        alert("No Art Number Entered\nEnter Art Number");
        artInput.active = true;
      }
    }

    // Set textframes contents & close window
    if (orderInput.text && artInput.text) {
      orderName.contents = "ORDER " + orderInput.text.trim();
      artName.contents = "ART FILE: " + artInput.text.trim().toUpperCase();
      gui.close();
    }

    // Lock Metadata layer
    metadataLayer.locked = true;
  });

  // Show GUI
  gui.show();
}

// Run
try {
  if (
    app.documents.length > 0 &&
    app.activeDocument.artboards[0].name === "NTF_Template"
  ) {
    NTF_Set_OrderArt();
  } else {
    throw new Error("Template File Not Active");
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
