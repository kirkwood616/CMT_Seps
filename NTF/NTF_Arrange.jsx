function NTF_Arrange() {
  // Active Document
  var doc = app.activeDocument;

  // Current Selection
  var sel = doc.selection;

  // Exit if no selection
  if (!sel.length) {
    throw new Error("No Selected Art" + "\n" + "Select Art Before Running.");
  }

  // Copy array of selection
  var selCopy = sel.slice();

  // Storage for matches
  var matchStore = new Array();

  // Hash table
  var hash = {};

  // Loop selection in reverse order from largest to smallest width
  for (var i = sel.length; i--; ) {
    // Skip if item index is in hash table
    if (hash[i]) continue;

    // Add current item to hash table
    hash[i] = 1;

    // Array for matches
    var matches = new Array();

    // Add current item's index to matches array
    matches.push(i);

    // Width log, starting with current item's width
    var widthLog = sel[i].width;

    // Loop matching copy in same reverse order\
    for (var j = selCopy.length; j--; ) {
      // Skip if item index is in hash table
      if (hash[j]) continue;

      // Check if items' width + 0.50" (36) margin is less or equal to usable width space
      if (widthLog + selCopy[j].width + 36 <= 1080) {
        // Add item's index to hash table & matches array
        hash[j] = 1;
        matches.push(j);

        // Add item's width + margin to width log
        widthLog += selCopy[j].width + 36;
      }
    }

    // Add matches array to the matchStore array
    matchStore.push(matches);
  }

  // 1080 = 15" MAX WIDTH
  // 1440 = 20" MAX HEIGHT (1449 = 20.125" ext HEIGHT)
  // 54 = 0.75"
  // 36 = 0.50"

  // 1620 bottom guide
  // 1588.3859 bottom starting position
  // 36 left guide
  // 1116 right guide

  // Swatches
  var docSwatches = doc.swatches;

  // Get swatch name
  var colorSwatch = new String();

  for (var i = 0; i < docSwatches.length; i++) {
    if (docSwatches[i].name !== "[None]" && docSwatches[i].name !== "[Registration]") {
      colorSwatch = removeSwatchInfo(docSwatches[i].name);
    }
  }

  // Active layer
  var activeLayer = doc.activeLayer;
  activeLayer.name = colorSwatch + "_1";

  // Track count of layers named
  var layerCount = 1;

  // Bottom start position
  var yPosition = -1588.3859;

  // Loop matchStore array (of arrays)
  for (var i = 0; i < matchStore.length; i++) {
    var matchSet = matchStore[i];
    var lastIndex = matchSet.length - 1;
    var lastItem = matchSet[lastIndex];

    // Add new line w/ margin into yPosition tracker
    yPosition += sel[matchSet[0]].height;
    if (i > 0) yPosition += 36;

    // If yPosition exceeds usable height on layer...
    if (yPosition > -139.5) {
      // Reset yPosition to bottom start position
      yPosition = -1588.3859 + sel[matchSet[0]].height;

      // Increase layer count
      layerCount++;

      // Make new layer for next set, name & position above previous layer
      var newLayer = doc.layers.add();
      newLayer.name = removeNumberSuffix(activeLayer.name) + layerCount;
      newLayer.move(activeLayer, ElementPlacement.PLACEBEFORE);

      // Reset active layer to new layer
      activeLayer = newLayer;
    }

    // First item always aligned to left guide
    sel[matchSet[0]].position = [36, yPosition];
    sel[matchSet[0]].move(activeLayer, ElementPlacement.PLACEATEND);

    // Last item always aligned to right guide
    if (matchSet.length > 1) {
      var lastItemRight = 1116 - sel[lastItem].width;
      sel[lastItem].position = [lastItemRight, yPosition];
      sel[lastItem].move(activeLayer, ElementPlacement.PLACEATEND);
    }

    // Position lines over 2 items spacing evenly
    if (matchSet.length > 2) {
      var xPositionFirstItem = 36 + sel[matchSet[0]].width;
      var gap = sel[lastItem].position[0] - xPositionFirstItem;
      var centerItemsWidth = 0;

      // Populate total width of items to place into centerItemsWidth
      for (var j = 1; j < matchSet.length; j++) {
        if (j === lastIndex) break;
        centerItemsWidth += sel[matchSet[j]].width;
      }

      // Calculate margin between each item
      var marginSpace = (gap - centerItemsWidth) / (matchSet.length - 1);
      // Value of new X position for each item
      var xPosLog = xPositionFirstItem + marginSpace;

      // Position item & update X position
      for (var k = 1; k < matchSet.length; k++) {
        if (k === lastIndex) break;
        sel[matchSet[k]].position = [xPosLog, yPosition];
        sel[matchSet[k]].move(activeLayer, ElementPlacement.PLACEATEND);
        xPosLog += sel[matchSet[k]].width + marginSpace;
      }
    }
  }

  // Color new layers & create named swatches
  var docLayers = doc.layers;

  // Store for named color layers
  var colorLayers = new Array();

  for (var i = docLayers.length; i--; ) {
    if (docLayers[i].name.indexOf("_") !== -1) {
      colorLayers.push(docLayers[i]);
    }
  }

  // De-select everything
  doc.selection = null;

  // Spot colors in document
  var docSpots = doc.spots;

  // Names
  var theSwatch = doc.defaultFillColor.spot;

  for (var i = 0; i < colorLayers.length; i++) {
    // Rename the swatch
    if (i === 0) {
      theSwatch.name = colorLayers[i].name;
      continue;
    }

    // Add new Spot swatch to pallette, named by current layer w/ color values
    var newSpot = docSpots.add();
    newSpot.name = colorLayers[i].name;
    newSpot.colorType = ColorModel.SPOT;
    newSpot.color = theSwatch.color;

    // Declare new SpotColor & assign newSpot to value
    var newSpotColor = new SpotColor();
    newSpotColor.spot = newSpot;

    // Select all items on current layer & color fill w/ named swatch spot
    colorLayers[i].hasSelectedArtwork = true;
    doc.defaultFillColor = newSpotColor;

    // De-select everything
    doc.selection = null;
  }
}

// Run
try {
  if (app.documents.length > 0) {
    NTF_Arrange();
  } else {
    throw new Error("Template File Not Active");
  }
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
}

//*******************
// Helper functions
//*******************

/**
 * Remove unwanted characters from swatch text
 * @param {String}    colorName - Spot swatch color name
 * @returns {String}  Text with removed chars
 */
function removeSwatchInfo(colorName) {
  // Remove any forward slashes from text
  var noForwardSlash = colorName.replace(/\//g, "");

  // Remove "Spot" from text
  var noSpot = noForwardSlash.replace(/SPOT /gi, "");

  // Remove parenthesis and contents contained between
  var noParenthesis = noSpot.replace(/\s*\(.*?\)\s*/g, "");

  return noParenthesis.toUpperCase();
}

/**
 *
 * @param {String}    theName
 * @returns {String}  A string trimmed to the last occurence of an underscore, or the originally supplied string if no underscore is present.
 */
function removeNumberSuffix(theName) {
  var lastUnderscore = theName.lastIndexOf("_");

  if (lastUnderscore !== -1) {
    return theName.slice(0, lastUnderscore + 1);
  } else {
    return theName;
  }
}
