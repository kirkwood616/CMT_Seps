//@include '../UTILITIES/Settings.jsx';
//@include '../UTILITIES/Layers.jsx';
//@include '../UTILITIES/FormatText.jsx';

function RTF_Open_Template_FromFile() {
  // Illustrator Coordinate System
  app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;

  // Active Document
  var doc = app.activeDocument;
  var docName = doc.name;

  // If Art layer try to select, else alert & exit if no selection
  selectArtLayer();

  // Formatted art file name
  var artNumber = formatArtName(doc.name);

  // Copy art
  app.copy();

  // Set up & load settings
  var settingsFile = setupSettingsFile("CMT_Seps_Settings", "Settings_Config.json");
  var settingsData = loadJSONData(settingsFile);
  var filePath = settingsData.RTF_templatePath;

  // Open template document
  app.open(new File(filePath));

  // Reset active document to template
  doc = app.activeDocument;

  // Metadata
  var metadataLayer = doc.layers.getByName("Metadata");
  var artName = metadataLayer.textFrames.getByName("ART FILE");
  artName.contents = artNumber;

  // Paste Position Ungroup function
  //@include './RTF_Action_PastePositionUngroup.jsx';

  // Set Order/Art #
  //@include './RTF_OrderArtPrompt.jsx';
}

// Run
try {
  RTF_Open_Template_FromFile();
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
}
