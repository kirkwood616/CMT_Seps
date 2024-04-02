#include 'json2.js';

function SP_SaveFile() {
  // Set up & load settings
  var settingsFile = setupSettingsFile("CMT_Seps_Settings", "SP_settings.json");
  var settingsData = loadJSONData(settingsFile);
  var destinationFolder = settingsData.SP_savePath;

  // Active Document
  var doc = app.activeDocument;

  // Metadata layer
  var metadataLayer = doc.layers.getByName("Metadata");
  var metaGroup = metadataLayer.groupItems.getByName("MetaGroup");
  var metaLocation = metaGroup.textFrames.getByName("_LOCATION").contents.toLowerCase();
  var metaArtFile = metaGroup.textFrames.getByName("_ART FILE").contents;

  // Create file name with appropriate ending
  var fileName = metaArtFile + metaLocation + ".ai";

  try {
    // Save file
    doc.saveAs(new File(destinationFolder + fileName));

    // Alert
    alert("File Saved" + "\n" + destinationFolder + fileName);
  } catch (e) {
    throw new Error(e.message);
  }
}

// Run
try {
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "SP_Template") {
    SP_SaveFile();
  } else {
    throw new Error("SP Template File Not Active");
  }
} catch (e) {
  alert(e, "Script Alert", true);
}

//*******************
// Helper functions
//*******************

function setupSettingsFile(folderName, fileName) {
  var settingsFolderPath = Folder.myDocuments + "/" + folderName;
  var settingsFolder = new Folder(settingsFolderPath);

  try {
    if (!settingsFolder.exists) {
      throw new Error("Settings folder doesn't exist." + "\n" + "Run 'SP Settings' and save your settings.");
    }

    var settingsFilePath = settingsFolder + "/" + fileName;
    var settingsFile = new File(settingsFilePath);

    if (!settingsFile.exists) {
      throw new Error("Settings file doesn't exist." + "\n" + "Run 'SP Settings' and save your settings.");
    }

    return new File(settingsFilePath);
  } catch (e) {
    throw new Error(e.message);
  }
}

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
