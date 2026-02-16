//@include '../UTILITIES/Settings.jsx';

function DTF_Names_CutProof_SaveFile() {
  // System
  var slash = getSlashOS();

  // Set up & load settings
  var settingsFile = setupSettingsFile(
    "CMT_Seps_Settings",
    "Settings_Config.json",
  );
  var settingsData = loadJSONData(settingsFile);
  var destinationFolder = settingsData.DTF_proofTemplateSavePath;

  // Active Document
  var doc = app.activeDocument;

  // Target Metadata layer, Order & Art File text frames
  var metadataLayer = doc.layers.getByName("Metadata");
  var orderNumber = metadataLayer.textFrames.getByName("ORDER_NUMBER").contents;
  var artNumber = metadataLayer.textFrames.getByName("ART_NUMBER").contents;

  // Create file name with appropriate ending
  var fileName =
    artNumber.toUpperCase() + "sc (DTF NAMES " + orderNumber + ").ai";

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
  if (
    app.documents.length > 0 &&
    app.activeDocument.artboards[0].name === "CP_1"
  ) {
    DTF_Names_CutProof_SaveFile();
  } else {
    throw new Error("Template File Not Active");
  }
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
}
