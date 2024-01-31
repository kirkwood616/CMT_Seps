function SP_PageProof_OrderArtDuePrompt() {
  // Active Document
  var doc = app.activeDocument;

  // PROOF layer items
  var proofLayer = doc.layers.getByName("PROOF");
  var orderNumber = proofLayer.textFrames.getByName("ORDER_NUMBER");
  var artNumber = proofLayer.textFrames.getByName("ART_NUMBER");
  var dueDate = proofLayer.textFrames.getByName("DUE");

  // Replace leading text on proof layer items
  var orderNumberText = orderNumber.textRange.contents.replace(/ORDER #: /gi, "");
  var artNumberText = artNumber.textRange.contents.replace(/ART #: /gi, "").toUpperCase();
  var dueDateText = dueDate.textRange.contents.replace(/DUE: /gi, "");

  // GUI Window
  var gui = new Window("dialog", "SET ORDER & ART NUMBER");
  gui.orientation = "column";
  gui.preferredSize.width = 300;

  // Order Panel
  var orderPanel = createPanel(gui, "Order Number");
  var orderInput = orderPanel.add("edittext", undefined, orderNumberText);
  orderInput.active = true;

  // Art Panel
  var artPanel = createPanel(gui, "Art Number");
  var artInput = artPanel.add("edittext", undefined, artNumberText);

  // Due Date
  var dueDatePanel = createPanel(gui, "Art Number");
  var dueDateInput = dueDatePanel.add("edittext", undefined, dueDateText);

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
    if (!orderInput.text || !artInput.text || !dueDateInput.text) {
      alert("Missing Values" + "\n" + "Enter Values");
    }

    // Set textframes contents & close window
    if (orderInput.text && artInput.text && dueDateInput.text) {
      orderNumber.contents = "ORDER #: " + orderInput.text;
      artNumber.contents = "ART #: " + artInput.text.toUpperCase();
      dueDate.contents = "DUE DATE: " + dueDateInput.text;
      gui.close();
    }
  });

  // Show GUI
  gui.show();
}

// Run
try {
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "PAGE_PROOF") {
    SP_PageProof_OrderArtDuePrompt();
  } else {
    throw new Error("PAGE_PROOF Template Not Active");
  }
} catch (e) {
  alert(e, "Script Alert", true);
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
