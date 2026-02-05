//@include '../UTILITIES/Settings.jsx';

function DTF_SaveFile() {
  // System
  var slash = getSlashOS();

  // Set up & load settings
  var settingsFile = setupSettingsFile(
    "CMT_Seps_Settings",
    "Settings_Config.json"
  );
  var settingsData = loadJSONData(settingsFile);
  var destinationFolder = settingsData.NTF_savePath;

  // Active Document
  var doc = app.activeDocument;

  // // Create file name with appropriate ending & save options
  var fileName = doc.layers[0].name + " (DTF).pdf";
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
        qualityPreset
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
    DTF_SaveFile();
  } else {
    throw new Error("SP Template File Not Active");
  }
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
}
