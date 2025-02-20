//@include '../UTILITIES/Settings.jsx';

function SP_SaveFile() {
  // System
  var slash = getSlashOS();

  // Set up & load settings
  var settingsFile = setupSettingsFile("CMT_Seps_Settings", "Settings_Config.json");
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
    doc.saveAs(new File(destinationFolder + slash + fileName));

    // Alert
    alert("File Saved" + "\n" + destinationFolder + slash + fileName);
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
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
}
