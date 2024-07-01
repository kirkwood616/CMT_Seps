#include 'json2.js';

function NTF_Open_Template_FromFile() {
  // Set up & load settings
  var settingsFile = setupSettingsFile("CMT_Seps_Settings", "Settings_Config.json");
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

  // Ungroup art
  app.executeMenuCommand("ungroup");
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

//*******************
// Helper functions
//*******************

/**
 * Uses supplied folder and file name to pull settings from, or creates folder & file if they don't exist.
 * @param {string} folderName Name of folder
 * @param {string} fileName Name of file
 * @returns {File}
 */
function setupSettingsFile(folderName, fileName) {
  var settingsFolderPath = Folder.myDocuments + "/" + folderName;
  var settingsFolder = new Folder(settingsFolderPath);
  if (!settingsFolder.exists) settingsFolder.create();
  var settingsFilePath = settingsFolder + "/" + fileName;
  return new File(settingsFilePath);
}

/**
 * Parses a JSON file and returns the data as an object.
 * @param {File}      file JSON file
 * @returns {Object}  Parsed JSON data
 */
function loadJSONData(file) {
  if (file.exists) {
    try {
      file.encoding = "UTF-8";
      file.open("r");
      var data = file.read();
      file.close();
      data = JSON.parse(data);
      return data;
    } catch (e) {
      ("Error loading Settings file.");
    }
  }
}