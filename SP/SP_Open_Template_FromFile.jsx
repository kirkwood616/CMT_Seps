//@include '../UTILITIES/Settings.jsx';
//@include '../UTILITIES/Layers.jsx';
//@include '../UTILITIES/FormatText.jsx';

function SP_Open_Template_FromFile() {
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
  var filePath = settingsData.SP_templatePath;

  // Open template document
  app.open(new File(filePath));

  // Reset active document to template
  doc = app.activeDocument;

  // Illustrator Coordinate System
  app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;

  // Registration
  var regLayer = doc.layers.getByName("Registration");
  var regBottomCenter = regLayer.groupItems.getByName("REG_BOTTOM_CENTER");

  // Transfer Art Layer
  var artLayer = doc.layers.getByName("Art");

  // Artboard Index
  var artboardIndex = doc.artboards.getActiveArtboardIndex();

  // Artboard rectangle bounding coordinates array
  var artboardBounds = doc.artboards[artboardIndex].artboardRect;

  // Centered X position on artboard
  var regCenteredPosition = 553.22509765623;

  // Deselect everything
  doc.selection = null;

  // Set Active Layer to Transfer Art Layer
  doc.activeLayer = artLayer;

  // Paste & group art
  app.paste();

  // Selected pasted art
  var pastedArt = doc.selection[0];

  // Rotate art if file name contains a pre-rotated location suffix
  if (docName.indexOf("ud") !== -1 || docName.indexOf("pk") !== -1) {
    pastedArt.rotate(180);
  }

  // Position art horizontally centered and 2 inches from top of artboard
  pastedArt.position = new Array((artboardBounds[2] - artboardBounds[0]) / 2 - pastedArt.width / 2, -144);

  // Store height of art
  var artHeight = pastedArt.height;

  // Move registration mark 0.50" down from bottom of art
  regBottomCenter.position = [regCenteredPosition, artHeight * -1 + -180];

  // Target Metadata layer, Order & Art File text frames
  var metadataLayer = doc.layers.getByName("Metadata");
  var metaGroup = metadataLayer.groupItems.getByName("MetaGroup");
  var artName = metaGroup.textFrames.getByName("_ART FILE");

  // Set Art File Metadata to original filename
  artName.contents = artNumber;

  // De-select everything
  doc.selection = null;
}

// Run
try {
  SP_Open_Template_FromFile();
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
}
