#include 'json2.js';

function SP_Open_Template_FromFile() {
  // Active Document
  var doc = app.activeDocument;
  var sel = doc.selection;

  // Exit if no selection
  if (!sel.length) {
    throw new Error("No Selected Art" + "\n" + "Select Art Before Running.");
  }

  var artNumber = formatArtName(doc.name);

  // Copy art
  app.copy();

  // Set up & load settings
  var settingsFile = setupSettingsFile("CMT_Seps_Settings", "SP_settings.json");
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
  app.executeMenuCommand("group");

  // Selected pasted art
  var pastedArt = doc.selection[0];

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
}

try {
  SP_Open_Template_FromFile();
} catch (e) {
  alert(e + "\n\n" + e.line, "Script Alert", true);
}

//*******************
// Helper functions
//*******************

function formatArtName(artName) {
  var newArtName = artName.replace(/.ai/gi, "");
  var noParenthesis = newArtName.replace(/\s*\(.*?\)\s*/g, "");
  newArtName = noParenthesis;

  switch (true) {
    case newArtName.indexOf("sc") !== -1:
    case newArtName.indexOf("sl") !== -1:
    case newArtName.indexOf("sr") !== -1:
    case newArtName.indexOf("pk") !== -1:
    case newArtName.indexOf("ud") !== -1:
      newArtName = newArtName.substring(0, newArtName.length - 2);
      break;
    case newArtName.indexOf("yoke") !== -1:
      newArtName = newArtName.substring(0, newArtName.length - 4);
      break;
    default:
      break;
  }

  return newArtName;
}

function setupSettingsFile(folderName, fileName) {
  var settingsFolderPath = Folder.myDocuments + "/" + folderName;
  var settingsFolder = new Folder(settingsFolderPath);

  try {
    if (!settingsFolder.exists) {
      throw new Error("Settings folder doesn't exist." + "\n" + "Run 'SP Settings' and save your settings.");
    }
  
    var settingsFilePath = settingsFolder + "/" + fileName;
    var settingsFile = new File(settingsFilePath);

    if (!settingsFile.exists) {
      throw new Error("Settings file doesn't exist." + "\n" + "Run 'SP Settings' and save your settings.");
    }

    return new File(settingsFilePath);
  } catch (e) {
    throw new Error(e.message);
  }
}

function loadJSONData(file) {
  if (file.exists) {
    try {
      file.encoding = "UTF-8";
      file.open("r");
      var data = file.read();
      file.close();
      data = JSON.parse(data);
      return data;
    } catch (e) {
      throw new Error("Error loading Settings file.");
    }
  }
}