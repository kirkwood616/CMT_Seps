//@include 'json2.js';

function SP_PageProof_SaveFile() {
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
  var destinationFolder = settingsData.SP_proofTemplateSavePath;

  // Active Document
  var doc = app.activeDocument;

  // PROOF layer items
  var proofLayer = doc.layers.getByName("PROOF");
  var artNumber = proofLayer.textFrames.getByName("ART_NUMBER");
  var artNumberText = artNumber.textRange.contents.replace(/ART #: /gi, "").toUpperCase();

  // Create file name with appropriate ending
  var fileName = artNumberText + " (PP)" + ".ai";

  try {
    // Save file
    doc.saveAs(new File(destinationFolder + slash + fileName));

    // Alert
    alert("File Saved" + "\n" + destinationFolder + slash + fileName);
  } catch (e) {
    throw new Error(e.message);
  }
}

// Run
try {
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "PAGE_PROOF") {
    SP_PageProof_SaveFile();
  } else {
    throw new Error("PAGE_PROOF Template Not Active");
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

  try {
    if (!settingsFolder.exists) {
      throw new Error("Settings folder doesn't exist." + "\n" + "Run 'CMT SEPS SETTINGS' and save your settings.");
    }

    var settingsFilePath = settingsFolder + "/" + fileName;
    var settingsFile = new File(settingsFilePath);

    if (!settingsFile.exists) {
      throw new Error("Settings file doesn't exist." + "\n" + "Run 'CMT SEPS SETTINGS' and save your settings.");
    }

    return new File(settingsFilePath);
  } catch (e) {
    throw new Error(e.message);
  }
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
      throw new Error("Error loading Settings file.");
    }
  }
}
