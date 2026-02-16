//@include '../UTILITIES/Settings.jsx';
//@include '../UTILITIES/Elements.jsx';
//@include '../UTILITIES/Colors.jsx';

function DTF_Names_Open_FromFile() {
  // Set up & load settings
  var settingsFile = setupSettingsFile(
    "CMT_Seps_Settings",
    "Settings_Config.json",
  );
  var settingsData = loadJSONData(settingsFile);
  var templateDocPath = settingsData.DTF_templatePath;

  // Active Document
  var fileDoc = app.activeDocument;

  // Selection
  var sel = fileDoc.selection;

  // Exit if art not selected
  if (fileDoc.selection.length < 1) {
    throw new Error("Select Art Before Running.");
  }

  // Copy selection
  app.copy();

  // Deselect everything
  fileDoc.selection = null;

  // Open Cut Proof Template
  app.open(new File(templateDocPath));

  // Open Template
  var templateDoc = app.activeDocument;

  // Target Transfer Art layer, make active, paste selection & group art
  var artLayer = templateDoc.layers.getByName("Art");
  templateDoc.activeLayer = artLayer;
  app.paste();
  app.executeMenuCommand("group");

  // Reset selection to pasted art
  sel = templateDoc.selection[0];

  // Ungroup art if multiple lines
  var isMultiline = isGroupMultiline(sel);

  if (isMultiline) app.executeMenuCommand("ungroup");

  // Change spot Whites to the standard visible color values
  toVisibleWhite();

  // Zoom to fit selection
  //@include '../UTILITIES/ZoomAndCenterSelection.jsx';

  // Input for Order / Art # / Due Date
  //@include './DTF_Names_OrderArtPrompt.jsx';
}

// Run
try {
  if (app.documents.length > 0) {
    DTF_Names_Open_FromFile();
  } else {
    throw new Error("No Document Active");
  }
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
}
