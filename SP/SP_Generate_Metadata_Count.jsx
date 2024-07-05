function SP_Generate_Metadata_Count() {
  // Active Document
  var doc = app.activeDocument;

  // Swatches
  var docSwatches = doc.swatches;

  // Metadata
  var metadataLayer = doc.layers.getByName("Metadata");
  var metaGroup = metadataLayer.groupItems.getByName("MetaGroup");
  var metaDataGroups = metaGroup.groupItems;

  // Boolean status for if COLOR COUNT group in Metadata
  var hasColorCount = false;

  // Storage
  var swatchStorage = new Array();

  // Deselect everything
  doc.selection = false;

  // Unlock Metadata layer
  metadataLayer.locked = false;

  // Check for if COLOR COUNT group exists
  for (var i = 0; i < metaDataGroups.length; i++) {
    if (metaDataGroups[i].name === "_COLOR COUNT") {
      hasColorCount = true;
    }
  }

  // Exit if _COLOR COUNT group not found
  if (!hasColorCount) {
    throw new Error("'_COLOR COUNT' group not found in Metadata.");
  }

  // Add swatches to storage
  for (var i = 0; i < docSwatches.length; i++) {
    if (docSwatches[i].name !== "[None]" && docSwatches[i].name !== "[Registration]") {
      swatchStorage.push(docSwatches[i]);
    }
  }

  // COLOR COUNT Group
  var colorCount = metaDataGroups.getByName("_COLOR COUNT");
  var colorCountTextFrames = colorCount.textFrames;

  // _COLOR COUNT groups & text frames
  var countGroup = colorCount.groupItems.getByName("_COUNT GROUP");
  var countGroupTextFrames = countGroup.textFrames;
  var ofCountText = colorCountTextFrames.getByName("_OF COUNT");

  // Remove all text frames except the first one
  if (countGroupTextFrames.length > 1) {
    for (var i = countGroupTextFrames.length; i--; ) {
      if (i !== 0) {
        countGroupTextFrames[i].remove();
      }
    }
  }

  // Add text frame numbers & color
  for (var i = 0; i < swatchStorage.length; i++) {
    countGroupTextFrames[i].name = (i + 1).toString();
    countGroupTextFrames[i].contents = (i + 1).toString();
    countGroupTextFrames[i].textRange.characterAttributes.fillColor = swatchStorage[i].color;

    // Duplicate text frame and arrange descending
    if (i !== swatchStorage.length - 1) {
      countGroupTextFrames[i].duplicate().zOrder(ZOrderMethod.BRINGTOFRONT);
    } else {
      countGroupTextFrames[i].zOrder(ZOrderMethod.BRINGTOFRONT);
    }
  }

  // Set of count with total color number
  ofCountText.contents = "of " + swatchStorage.length;
}

// Run
try {
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "SP_Template") {
    SP_Generate_Metadata_Count();
  } else {
    throw new Error("SP Template File Not Active");
  }
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
}
