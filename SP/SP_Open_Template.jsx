#include 'json2.js';

function SP_Open_Template() {
  // Set up & load settings
  var settingsFile = setupSettingsFile("CMT_Seps_Settings", "SP_settings.json");
  var settingsData = loadJSONData(settingsFile);
  var filePath = settingsData.SP_templatePath;

  // Open template document
  app.open(new File(filePath));
}

// Run
try {
  SP_Open_Template();
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
