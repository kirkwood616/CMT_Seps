function SP_Delete_UB() {
  // Active Document
  var doc = app.activeDocument;

  // Original Active Layer
  var originLayer = doc.activeLayer;

  // Deselect everything
  doc.selection = false;

  // Layers in document
  var docLayers = doc.layers;

  // Swatches in document
  var docSwatches = doc.swatches;
  var docSpots = doc.spots;
  var registration = docSpots.getByName("[Registration]");

  // Metadata
  var metadataLayer = doc.layers.getByName("Metadata");
  var metaGroup = metadataLayer.groupItems.getByName("MetaGroup");
  var metaDataGroups = metaGroup.groupItems;
  var metaTextFrames = metaGroup.textFrames;
  var colorCount = metaDataGroups.getByName("_COLOR COUNT");
  var countGroup = colorCount.groupItems.getByName("_COUNT GROUP");
  var countGroupTextFrames = countGroup.textFrames;

  // Unlock Metadata layer
  metadataLayer.locked = false;

  // Find & change metadata color to registration
  for (var i = 0; i < metaTextFrames.length; i++) {
    var frame = metaTextFrames[i];
    var frameColor = frame.textRange.characterAttributes.fillColor;

    if (frame.name.charAt(0) !== "_") {
      if (frameColor.spot.name.indexOf("WHITE UB") !== -1) {
        frame.contents = "COLOR";
        frameColor.spot = registration;
      }
    }
  }

  // Find & change metadata color count to registration
  for (var i = 0; i < countGroupTextFrames.length; i++) {
    var count = countGroupTextFrames[i];
    var countColor = count.textRange.characterAttributes.fillColor;

    if (countColor.spot.name.indexOf("WHITE UB") !== -1) {
      countColor.spot = registration;
    }
  }

  // Delete contents of UB layers
  for (var i = 0; i < docLayers.length; i++) {
    if (docLayers[i].name.indexOf("UB") !== -1) {
      doc.activeLayer = docLayers[i];
      docLayers[i].hasSelectedArtwork = true;
      app.cut();
      doc.selection = false;
    }
  }

  // Delete UB swatches
  for (var i = 0; i < docSwatches.length; i++) {
    if (docSwatches[i].name.indexOf("WHITE UB") !== -1) {
      docSwatches[i].remove();
    }
  }

  // Reset Active Layer to original
  doc.activeLayer = originLayer;
}

// Run
try {
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "SP_Template") {
    SP_Delete_UB();
  } else {
    throw new Error("SP Template File Not Active");
  }
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
}
