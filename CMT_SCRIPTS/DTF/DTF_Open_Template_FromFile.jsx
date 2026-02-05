//@include '../UTILITIES/Settings.jsx';
//@include '../UTILITIES/Layers.jsx';
//@include '../UTILITIES/FormatText.jsx';
//@include '../UTILITIES/Positioning.jsx';
//@include '../UTILITIES/Colors.jsx';

function DTF_Open_Template_FromFile() {
  // Active Document
  var doc = app.activeDocument;

  // If Art layer try to select, else alert & exit if no selection
  selectArtLayer();

  // Formatted art file name
  var artNumber = formatArtName(doc.name);

  // Copy art
  app.copy();

  // Deselect everything
  doc.selection = null;

  // Set up & load settings
  var settingsFile = setupSettingsFile(
    "CMT_Seps_Settings",
    "Settings_Config.json"
  );
  var settingsData = loadJSONData(settingsFile);
  var filePath = settingsData.DTF_templatePath;

  // Open template document
  app.open(new File(filePath));

  // Reset active document to template
  doc = app.activeDocument;

  // Illustrator Coordinate System
  app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;

  // Art Layer
  var artLayer = doc.layers.getByName("Art");

  // Artboard
  var artboardIndex = doc.artboards.getActiveArtboardIndex();
  var artBoard = doc.artboards[artboardIndex];

  // Deselect everything
  doc.selection = null;

  // Set Active Layer to Transfer Art Layer
  doc.activeLayer = artLayer;

  // Paste & group art
  app.paste();

  // Selected pasted art
  var pastedArt = doc.selection[0];

  // Padding around all sides (18 = 0.25")
  var padding = 18;

  // Visible Bounds of art
  var theVisibleBounds = doc.visibleBounds;

  // Add padding to visible bounds & re-size artboard
  theVisibleBounds[0] -= padding; // left coordinate (use negative values to add artboard)
  theVisibleBounds[1] += padding; // top coordinate
  theVisibleBounds[2] += padding; // right coordinate
  theVisibleBounds[3] -= padding; // bottom coordinate (use negative values to add artboard)
  artBoard.artboardRect = theVisibleBounds;

  // Center on artboard
  centerOnArtboard(pastedArt, artBoard);

  // Re-Name Art Layer to Art Number
  artLayer.name = artNumber;

  // Deselect everything
  doc.selection = null;

  // View => Fit Artboard in Window
  app.executeMenuCommand("fitall");

  // Change spot white(s) to pure white
  toPureWhite();
}

// Run
try {
  DTF_Open_Template_FromFile();
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
}
