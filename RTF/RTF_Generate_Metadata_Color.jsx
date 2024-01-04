function RTF_Generate_Metadata_Color() {
  // Active Document
  var doc = app.activeDocument;

  // Swatches
  var docSwatches = doc.swatches;

  // Art Layer items
  var artLayer = doc.layers.getByName("Transfer Art");
  var artGroup = artLayer.groupItems.getByName("ArtGroup");
  var artGroupColors = artGroup.groupItems;

  // Metadata Layer items
  var metadataLayer = doc.layers.getByName("Metadata");
  var metadataArtColors = metadataLayer.groupItems.getByName("ART COLORS");
  var metadataArtColorsText = metadataArtColors.textFrames;

  // Unlock Metadata layer
  metadataLayer.locked = false;

  // Delete all Art Color Text Frames except the first one
  if (metadataArtColorsText.length > 1) {
    for (var i = metadataArtColorsText.length; i--; ) {
      if (i !== 0) {
        metadataArtColorsText[i].remove();
      }
    }
  }

  // Loop over ArtGroup color groups and create named text frames
  for (var i = 0; i < artGroupColors.length; i++) {
    var metaText = metadataArtColorsText[i];

    // Remove leading number & space from color group name
    var groupSwatchName = artGroupColors[i].name.slice(2);

    // Target swatch with same name
    var swatchMatch = docSwatches.getByName(groupSwatchName);

    // Change text frame contents and name to color group name
    metaText.contents = editMetadataText(artGroupColors[i].name);

    // metaText.contents = artGroupColors[i].name;
    metaText.name = artGroupColors[i].name;

    // Set color of text frame to the matching swatch color
    metaText.textRange.characterAttributes.fillColor = swatchMatch.color;

    // Duplicate text frame if over 1 color
    if (i !== artGroupColors.length - 1) {
      metaText.duplicate();
    }
  }

  // Lock Metadata layer
  metadataLayer.locked = true;
}

// Run
try {
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "RTF_Template") {
    RTF_Generate_Metadata_Color();
  } else {
    throw new Error("RTF Template File Not Active");
  }
} catch (e) {
  alert(e, "Script Alert", true);
}

//*******************
// Helper functions
//*******************

/**
 * Remove unwanted characters from Metadata color text
 * @param {String} colorName - Spot swatch color name
 * @returns {String} Text with removed chars
 */
function editMetadataText(colorName) {
  // Remove any forward slashes from text
  var noForwardSlash = colorName.replace(/\//g, " ");

  // Remove "Spot" from text
  var noSpot = noForwardSlash.replace(/SPOT/gi, "");

  // Remove "PANTONE " from text
  var noPantone = noSpot.replace(/PANTONE /gi, "");

  // Remove parenthesis and contents contained between
  var noParenthesis = noPantone.replace(/\s*\(.*?\)\s*/g, " ");

  return noParenthesis;
}
