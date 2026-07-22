//@include '../UTILITIES/Artboards.jsx';
//@include '../UTILITIES/Colors.jsx';
//@include '../UTILITIES/Layers.jsx';
//@include '../UTILITIES/Settings.jsx';

function DTF_Recolor() {
  // Set up & load settings
  var settingsFile = setupSettingsFile(
    "CMT_Seps_Settings",
    "Settings_DTF_ColorLibrary.json",
  );
  var colorLibrary = loadJSONData(settingsFile);

  // Populate names of all swatches in Color Library
  var colorNames = new Array();

  for (var i = 0; i < colorLibrary.length; i++) {
    colorNames.push(colorLibrary[i].name);
  }

  // Active Document
  var doc = app.activeDocument;
  var docLayers = doc.layers;

  // If Art layer try to select, else alert & exit if no selection
  selectArtLayer();

  // Selection
  var sel = doc.selection;

  // Get the layer that the selection is on & set to active layer
  if (sel.length > 0) {
    var selItem = sel[0];
    var selLayer = selItem.layer.name;
    doc.activeLayer = doc.layers.getByName(selLayer);
  }

  // Original Active Layer
  var originLayer = doc.activeLayer;

  // Store visibility states of layers
  var visibleLayers = storeLayerVisibility();

  // Turn off visibility of all layers except for active
  for (var i = 0; i < docLayers.length; i++) {
    if (docLayers[i].name !== originLayer.name) {
      docLayers[i].visible = false;
    }
  }

  // Temporary Artboard (get enabled inks hack)
  var newArtboard = addInchArtboard();

  // Get enabled ink names from visible layer
  var enabledInks = storeEnabledInkNames();

  // Delete temporary Artboard
  newArtboard.remove();

  // Storage for spots
  var spotData = new Array();

  // Storage for swatches with no matches
  var noMatches = new Array();

  // Find matches & add to spotData or noMatches
  for (var i = 0; i < enabledInks.length; i++) {
    var theInk = enabledInks[i];
    var matchFound = false;

    // Skip if Black or White
    if (theInk === "Spot Black" || theInk === "Spot White") continue;

    // Add color data to storage
    for (var j = 0; j < colorLibrary.length; j++) {
      if (colorLibrary[j].name.indexOf(theInk) > -1) {
        matchFound = true;
        spotData.push(colorLibrary[j]);
      }
    }

    // Add to storage list if no library matches
    if (!matchFound) {
      noMatches.push(enabledInks[i]);
    }
  }

  // Deselect everything
  doc.selection = null;

  // Counter for Process Inks Found Alert
  var processAlertCount = 0;

  // Loop enabledInks & do work
  for (var i = 0; i < enabledInks.length; i++) {
    // Skip if unwanted color
    var isUnwantedColor = false;

    switch (enabledInks[i]) {
      case "Process Cyan":
      case "Process Magenta":
      case "Process Yellow":
      case "Process Black":
        if (processAlertCount === 0) {
          alert(
            "PROCESS INKS FOUND" + "\n\n" + "Non-Spot Colors Detected.",
            "Script Alert",
            true,
          );
        }
        isUnwantedColor = true;
        processAlertCount++;
        break;

      case "Spot Black":
      case "Spot White":
        isUnwantedColor = true;
        break;

      default:
        break;
    }

    // Skip if unwanted color found
    if (isUnwantedColor) continue;

    // Get swatch of enabled ink
    var enabledSwatch = doc.swatches.getByName(enabledInks[i]);

    // Storage for the matching swatch
    var theMatch = null;

    // Search storage & set match
    for (var j = 0; j < spotData.length; j++) {
      if (spotData[j].name.indexOf(enabledInks[i]) > -1) {
        theMatch = spotData[j];
      }
    }

    // If match found, add swatch & recolor
    if (theMatch !== null) {
      // Check if match swatch already exists
      var isMatchSwatch = false;

      for (var j = 0; j < doc.swatches.length; j++) {
        if (doc.swatches[j].name === theMatch.name) isMatchSwatch = true;
      }

      // Skip adding & recolor if match swatch exists
      if (isMatchSwatch) continue;

      // Deselect everything
      doc.selection = null;

      // Generate new Spot Color from the match
      var theColor = generateNewColor(theMatch);
      var newSpot = doc.spots.add();
      newSpot.name = theMatch.name;
      newSpot.colorType = ColorModel.SPOT;
      newSpot.color = theColor;

      // Get the Swatch of the spot match
      var newSwatch = doc.swatches.getByName(newSpot.name);

      // Select fill color of original color & set to new matched swatch
      doc.defaultFillColor = enabledSwatch.color;
      app.executeMenuCommand("Find Fill Color menu item");
      app.activeDocument.defaultFillColor = newSwatch.color;

      // Deselect everything
      doc.selection = null;
    }
  }

  // Restore layer visibility
  restoreVisibleLayers(visibleLayers);

  // Alert user if no matches found for items
  if (noMatches.length > 0) {
    var alertMessage =
      "Conversion Match Error\n\n" +
      "Matches Not Found For:\n\n" +
      noMatches.join("\n");

    alert(alertMessage, "Script Alert", true);
  }
}

// *****************************
// RUN
// *****************************
try {
  if (app.documents.length > 0) {
    DTF_Recolor();
  } else {
    throw new Error("No Document Active");
  }
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
}

// *****************************
// HELPER FUNCTIONS
// *****************************

/**
 * Returns a new Color from a color data object.
 * @param {Object}                  data - Color data object
 * @param {String}                  data.name - Name of Color
 * @param {"LAB" | "RGB" | "CMYK"}  data.kind - Spot Color Kind
 * @param {Array<Number>}           data.values - Color Values
 * @returns {LabColor|RGBColor|CMYKColor}
 */
function generateNewColor(data) {
  var newColor;

  switch (data.kind) {
    case "LAB":
      var newLAB = new LabColor();
      newLAB.l = data.values[0];
      newLAB.a = data.values[1];
      newLAB.b = data.values[2];
      newColor = newLAB;
      break;
    case "RGB":
      var newRGB = new RGBColor();
      newRGB.red = data.values[0];
      newRGB.green = data.values[1];
      newRGB.blue = data.values[2];
      newColor = newRGB;
    case "CMYK":
      var newCMYK = new CMYKColor();
      newCMYK.cyan = data.values[0];
      newCMYK.magenta = data.values[1];
      newCMYK.yellow = data.values[2];
      newCMYK.black = data.values[3];
      newColor = newCMYK;
    default:
      break;
  }

  return newColor;
}
