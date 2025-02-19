//@include '../UTILITIES/Settings.jsx';

function NTF_SaveFile() {
  // System
  var slash = getSlashOS();

  // Set up & load settings
  var settingsFile = setupSettingsFile("CMT_Seps_Settings", "Settings_Config.json");
  var settingsData = loadJSONData(settingsFile);
  var destinationFolder = settingsData.NTF_savePath;

  // Active Document
  var doc = app.activeDocument;

  // Metadata layer
  var metadataLayer = doc.layers.getByName("Metadata");
  var metaGroup = metadataLayer.groupItems.getByName("MetaGroup");
  var artName = metaGroup.textFrames.getByName("_ART FILE");
  var orderName = metaGroup.textFrames.getByName("_ORDER");
  var colorFrame = metaGroup.textFrames.getByName("COLOR");

  // Extract numbers from text frames
  var artNumber = artName.contents.replace(/ART FILE: /gi, "");
  var orderNumber = orderName.contents.replace(/ORDER /gi, "");

  // Get ink color
  var theColor = getColorName(colorFrame.contents);

  // Create file name with appropriate ending
  var fileName = artNumber + "sc " + "(NTF " + orderNumber + " " + theColor + ")" + ".ai";

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
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "NTF_Template") {
    NTF_SaveFile();
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
 * Takes a provided string, from ink color Metadata, trims the string to characters preceeding an underscore (if present) and returns the trimmed string.
 * @param {String} name
 * @returns {String}
 */
function getColorName(name) {
  var thisColor = name;

  var _index = name.indexOf("_");

  if (_index !== -1) {
    thisColor = name.slice(0, _index);
  }

  return thisColor;
}
