//@include 'SP_Generate_Metadata_Count.jsx';
//@include '../UTILITIES/FormatText.jsx';

function SP_Generate_Metadata() {
  // Active Document
  var doc = app.activeDocument;

  // Swatches
  var docSwatches = doc.swatches;

  // Metadata Layer items
  var metadataLayer = doc.layers.getByName("Metadata");
  var metaGroup = metadataLayer.groupItems.getByName("MetaGroup");
  var metaTextFrames = metaGroup.textFrames;

  // Storage
  var colorFrames = new Array();
  var swatchStorage = new Array();

  // Unlock Metadata layer
  metadataLayer.locked = false;

  // Deselect everything
  doc.selection = false;

  // Add colored text frames to storage
  for (var i = metaTextFrames.length; i--; ) {
    if (metaTextFrames[i].name.charAt(0) !== "_") {
      colorFrames.push(metaTextFrames[i]);
    }
  }

  // Remove all colored text frames except the first one
  for (var i = 0; i < colorFrames.length; i++) {
    if (i !== 0) {
      colorFrames[i].remove();
    }
  }

  // Remove frames from storage
  colorFrames.length = 1;

  // Add swatches to storage
  for (var i = 0; i < docSwatches.length; i++) {
    if (docSwatches[i].name !== "[None]" && docSwatches[i].name !== "[Registration]") {
      swatchStorage.push(docSwatches[i]);
    }
  }

  // Set edited name, contents and fill color
  for (var i = 0; i < swatchStorage.length; i++) {
    var nameForMeta = removeUnwantedChars(swatchStorage[i].name);

    colorFrames[i].name = "COLOR";
    colorFrames[i].contents = nameForMeta;
    colorFrames[i].textRange.characterAttributes.fillColor = swatchStorage[i].color;

    // Duplicate text frame if over 1 color
    if (i !== swatchStorage.length - 1) {
      var frameCopy = colorFrames[i].duplicate();
      colorFrames.push(frameCopy);
    }
  }
}

// Run
try {
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "SP_Template") {
    SP_Generate_Metadata();
    SP_Generate_Metadata_Count();
  } else {
    throw new Error("SP Template File Not Active");
  }
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
}
