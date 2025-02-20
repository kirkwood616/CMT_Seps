function SP_Set_ArtNumber() {
  // Active Document
  var doc = app.activeDocument;

  // Target Metadata layer, Order & Art File text frames
  var metadataLayer = doc.layers.getByName("Metadata");
  var metaGroup = metadataLayer.groupItems.getByName("MetaGroup");
  var artName = metaGroup.textFrames.getByName("_ART FILE");

  // Remove leading text in Order & Art File text frames
  var artNameText = artName.contents;

  // GUI Window
  var gui = new Window("dialog", "SET ART NUMBER");
  gui.orientation = "column";
  gui.preferredSize.width = 300;

  // Art Panel
  var artPanel = createPanel(gui, "Art Number");
  // Art Panel Input
  var artInput = artPanel.add("edittext", undefined, artNameText);
  artInput.active = true;

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
    if (!artInput.text) {
      alert("No Art Number Entered" + "\n" + "Enter Art Number");
      artInput.active = true;
    }

    // Set textframes contents & close window
    if (artInput.text) {
      artName.contents = artInput.text.toUpperCase();
      gui.close();
    }
  });

  // Show GUI
  gui.show();
}

// Run
try {
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "SP_Template") {
    SP_Set_ArtNumber();
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
 * Creates a panel item.
 * @param {Window|Group} parent Where to add panel into
 * @param {String} [title] Text for panel's upper-left title
 * @returns {Panel}
 */
function createPanel(parent, title) {
  var panel = parent.add("panel", undefined, title);
  panel.orientation = "column";
  panel.alignChildren = "fill";
  panel.preferredSize.width = 250;
  return panel;
}

/**
 * Creates a group item.
 * @param {Window|Group|Panel} parent Where to add group into
 * @param {String} orientation Orientation of the group
 * @returns {Group}
 */
function createGroup(parent, orientation) {
  var group = parent.add("group");
  group.orientation = orientation;
  return group;
}

/**
 * Creates a clickable button.
 * @param {Window|Group|Panel} parent Where to add button into
 * @param {String} title Text to be shown inside of button
 * @param {() => void} [onClick] Callback function to run when button is clicked
 * @returns {Button}
 */
function createButton(parent, title, onClick) {
  var button = parent.add("button", undefined, title);
  if (onClick !== undefined) button.onClick = onClick;
  return button;
}
