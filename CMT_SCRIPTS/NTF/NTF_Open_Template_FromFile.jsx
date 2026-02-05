//@include '../UTILITIES/Settings.jsx';
//@include '../UTILITIES/Elements.jsx';

function NTF_Open_Template_FromFile() {
  // Set up & load settings
  var settingsFile = setupSettingsFile(
    "CMT_Seps_Settings",
    "Settings_Config.json"
  );
  var settingsData = loadJSONData(settingsFile);
  var templateDocPath = settingsData.NTF_templatePath;

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

  // Open Cut Proof Template
  app.open(new File(templateDocPath));

  // Open Template
  var templateDoc = app.activeDocument;

  // Target Transfer Art layer, make active, paste selection & group art
  var artLayer = templateDoc.layers.getByName("Transfer Art");
  templateDoc.activeLayer = artLayer;
  app.paste();
  app.executeMenuCommand("group");

  // NTF_Template artboard info
  var templateArtBoard = templateDoc.artboards[0];
  var templateRect = templateArtBoard.artboardRect;

  // Reset selection to pasted art & position to edge of template artboard
  sel = templateDoc.selection[0];
  sel.position = [templateRect[0] - sel.width, sel.position[1]];

  // Ungroup art if multiple lines
  var isMultiline = isGroupMultiline(sel);

  if (isMultiline) app.executeMenuCommand("ungroup");

  // Set Order/Art #
  //@include './NTF_Set_OrderArt.jsx';

  // Zoom to fit selection
  //@include '../UTILITIES/ZoomAndCenterSelection.jsx';
}

// Run
try {
  if (app.documents.length > 0) {
    NTF_Open_Template_FromFile();
  } else {
    throw new Error("No Document Active");
  }
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
}
