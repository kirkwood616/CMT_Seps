//@include '../UTILITIES/Settings.jsx';

function NTF_CutProof_SaveFile() {
  // System
  var slash = getSlashOS();

  // Set up & load settings
  var settingsFile = setupSettingsFile("CMT_Seps_Settings", "Settings_Config.json");
  var settingsData = loadJSONData(settingsFile);
  var destinationFolder = settingsData.NTF_proofTemplateSavePath;

  // Active Document
  var doc = app.activeDocument;

  // Target Metadata layer, Order & Art File text frames
  var metadataLayer = doc.layers.getByName("Metadata");
  var orderNumber = metadataLayer.textFrames.getByName("ORDER_NUMBER").contents;
  var inkName = getColorName(metadataLayer.textFrames.getByName("INK_COLOR").contents);

  // Create file name with appropriate ending
  var fileName = orderNumber + " " + inkName + " (CP)" + ".ai";

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
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "CP_1") {
    NTF_CutProof_SaveFile();
  } else {
    throw new Error("Template File Not Active");
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
