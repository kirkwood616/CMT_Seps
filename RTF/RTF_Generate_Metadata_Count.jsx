function RTF_Generate_Metadata_Count() {
  // Active Document
  var doc = app.activeDocument;

  // Metadata
  var metadataLayer = doc.layers.getByName("Metadata");
  var metaDataGroups = metadataLayer.groupItems;

  // ART COLORS
  var artColorsGroup = metaDataGroups.getByName("ART COLORS");
  var artColorsTextFrames = artColorsGroup.textFrames;

  // Boolean status for if COLOR COUNT group in Metadata
  var hasColorCount = false;

  // Unlock Metadata layer
  metadataLayer.locked = false;

  // Check for if COLOR COUNT group exists
  for (var i = 0; i < metaDataGroups.length; i++) {
    if (metaDataGroups[i].name === "COLOR COUNT") {
      hasColorCount = true;
    }
  }

  if (hasColorCount) {
    // COLOR COUNT Group
    var colorCount = metaDataGroups.getByName("COLOR COUNT");
    var colorCountTextFrames = colorCount.textFrames;

    // COUNT GROUP & text frames
    var countGroup = colorCount.groupItems.getByName("COUNT GROUP");
    var countGroupTextFrames = countGroup.textFrames;

    // OF COUNT (text frame)
    var ofCountText = colorCountTextFrames.getByName("OF COUNT");

    // Remove all text frames except the first one
    if (artColorsTextFrames.length > 1) {
      for (var i = countGroupTextFrames.length; i--; ) {
        if (i !== 0) {
          countGroupTextFrames[i].remove();
        }
      }
    }

    // Add text frame numbers & color
    for (var j = 0; j < artColorsTextFrames.length; j++) {
      countGroupTextFrames[j].name = (j + 1).toString();
      countGroupTextFrames[j].contents = (j + 1).toString();
      countGroupTextFrames[j].textRange.characterAttributes.fillColor =
        artColorsTextFrames[j].textRange.characterAttributes.fillColor;

      if (j !== artColorsTextFrames.length - 1) {
        countGroupTextFrames[j].duplicate();
      }
    }

    // Set of count with total color number
    ofCountText.contents = "of " + artColorsTextFrames.length;
  }

  // Lock Metadata layer
  metadataLayer.locked = true;
}

// Run
try {
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "RTF_Template") {
    RTF_Generate_Metadata_Count();
  } else {
    throw new Error("RTF Template File Not Active");
  }
} catch (e) {
  alert(e, "Script Alert", true);
}
