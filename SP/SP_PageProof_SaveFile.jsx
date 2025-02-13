//@include '../UTILITIES/Settings.jsx';

function SP_PageProof_SaveFile() {
  // System
  var slash = getSlashOS();

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
