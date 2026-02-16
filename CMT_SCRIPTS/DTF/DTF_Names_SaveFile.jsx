//@include '../UTILITIES/Settings.jsx';
//@include '../UTILITIES/Colors.jsx';

function DTF_Names_SaveFile() {
  // System
  var slash = getSlashOS();

  // Set up & load settings
  var settingsFile = setupSettingsFile(
    "CMT_Seps_Settings",
    "Settings_Config.json",
  );
  var settingsData = loadJSONData(settingsFile);
  var destinationFolder = settingsData.DTF_savePath;

  // Active Document
  var doc = app.activeDocument;

  // Change spot whites to pure white color values
  toPureWhite();

  // // Create file name with appropriate ending & save options
  var fileName = doc.layers[0].name + ".pdf";
  var qualityPreset = "[Press Quality]";
  var pdfSaveOpts = new PDFSaveOptions();
  pdfSaveOpts.pDFPreset = qualityPreset;

  try {
    // Save file with save options
    doc.saveAs(new File(destinationFolder + slash + fileName), pdfSaveOpts);

    // Alert
    alert(
      "File Saved" +
        "\n" +
        destinationFolder +
        slash +
        fileName +
        "\n\n" +
        qualityPreset,
    );
  } catch (e) {
    throw new Error(e.message);
  }
}

// Run
try {
  if (
    app.documents.length > 0 &&
    app.activeDocument.artboards[0].name === "DTF_Template"
  ) {
    DTF_Names_SaveFile();
  } else {
    throw new Error("DTF Template File Not Active");
  }
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
}
