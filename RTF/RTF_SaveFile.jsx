#include 'json2.js';

function RTF_SaveFile() {
  // System
  var system = $.os.substring(0, 3);
  var slash;

  if (system === "Mac") {
    slash = "/";
  }
  if (system === "Win") {
    slash = "\\";
  }

  // Set up & load settings
  var settingsFile = setupSettingsFile("CMT_Seps_Settings", "Settings_Config.json");
  var settingsData = loadJSONData(settingsFile);
  var destinationFolder = settingsData.RTF_savePath;

  // Active Document
  var doc = app.activeDocument;

  // Metadata layer
  var metadataLayer = doc.layers.getByName("Metadata");

  // Text in Metadata's ART FILE text frame
  var metaArtFileText = metadataLayer.textFrames.getByName("ART FILE").contents;

  // Extract the art number from text frame
  var artNumber = metaArtFileText.replace(/ART FILE: /gi, "");

  // Create file name with appropriate ending
  var fileName = artNumber + "sc" + " " + "(RTF)" + ".ai";

  try {
    // Save file
    doc.saveAs(new File(destinationFolder + slash + fileName));

    // Alert
    alert("File Saved" + "\n" + destinationFolder + slash + fileName);
  } catch (e) {
    throw new Error(e);
  }
}

// Run
try {
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "RTF_Template") {
    RTF_SaveFile();
  } else {
    throw new Error("RTF Template File Not Active");
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
