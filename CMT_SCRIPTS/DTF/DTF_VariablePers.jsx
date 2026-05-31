//@include '../UTILITIES/Settings.jsx';

function DTF_VariablePers() {
  // Set up & load settings
  var settingsFile = setupSettingsFile(
    "CMT_Seps_Settings",
    "Settings_Config.json",
  );
  var settingsData = loadJSONData(settingsFile);
  var templateDocPath = settingsData.DTF_templatePath;

  // Pers Data Document
  var dataDoc = app.activeDocument;

  // Exit if no Dataset is loaded
  if (!dataDoc.dataSets.length) {
    throw new Error(
      "No Variable Dataset Loaded" +
        "\n\n" +
        "Load A Dataset In the Variables Window",
    );
  }

  // Create OUTPUT layer
  var outputLayer = dataDoc.layers.add();
  outputLayer.name = "OUTPUT";

  // Target Pers layer
  var persLayer = dataDoc.layers.getByName("Pers");
  dataDoc.activeLayer = persLayer;

  // Deselect everything
  dataDoc.selection = null;

  // Loop through all available datasets
  for (var i = 0; i < dataDoc.dataSets.length; i++) {
    var currentDataSet = dataDoc.dataSets[i];

    // Display the dataset to update the canvas
    currentDataSet.display();

    // Update to ensure all dynamic elements (like visibility) refresh correctly
    currentDataSet.update();

    // Create copy of dataset, outline & group, then move to output layer
    persLayer.hasSelectedArtwork = true;
    app.copy();
    dataDoc.selection = null;
    app.paste();
    app.executeMenuCommand("outline");
    app.executeMenuCommand("group");
    var dataSel = dataDoc.selection[0];
    dataSel.move(outputLayer, ElementPlacement.PLACEATEND);
    dataDoc.selection = null;
  }

  // Copy outlined datasets & delete output layer
  outputLayer.hasSelectedArtwork = true;
  app.cut();
  outputLayer.remove();

  // Open DTF Template
  app.open(new File(templateDocPath));
  var templateDoc = app.activeDocument;

  // Target art layer & paste in template
  var artLayer = templateDoc.layers.getByName("Art");
  templateDoc.activeLayer = artLayer;
  app.paste();

  // Deselect, redraw catch-up hack, select & outline any strokes
  templateDoc.selection = null;
  app.redraw();
  artLayer.hasSelectedArtwork = true;
  app.executeMenuCommand("expandStyle");
  app.executeMenuCommand("OffsetPath v22");
  templateDoc.selection = null;
}

// Run
try {
  if (
    app.documents.length > 0 &&
    app.activeDocument.artboards[0].name === "PERS_Template"
  ) {
    DTF_VariablePers();
  } else {
    throw new Error("No Document Active");
  }
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
}
