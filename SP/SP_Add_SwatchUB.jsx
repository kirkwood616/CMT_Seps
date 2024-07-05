function SP_Add_SwatchUB() {
  // Active Document
  var doc = app.activeDocument;

  // Swatches in document
  var docSwatches = doc.swatches;

  // Storage
  var swatchStorage = new Array();

  // Exit if WHITE UB swatch found
  for (var i = 0; i < docSwatches.length; i++) {
    if (docSwatches[i].name.indexOf("WHITE UB") !== -1) {
      return;
    }
  }

  // Add swatches to storage
  for (var i = 0; i < docSwatches.length; i++) {
    if (docSwatches[i].name !== "[None]" && docSwatches[i].name !== "[Registration]") {
      swatchStorage.push(docSwatches[i]);
    }
  }

  // Add swatch group
  var swatchGroup = doc.swatchGroups.add();

  // Add swatches from storage to swatch group
  for (var i = 0; i < swatchStorage.length; i++) {
    swatchGroup.addSwatch(swatchStorage[i]);
  }

  // Create WHITE UB swatch
  var newCMYK = new CMYKColor();
  newCMYK.cyan = 83.53;
  newCMYK.magenta = 0;
  newCMYK.yellow = 0;
  newCMYK.black = 0;

  var thisSpot = doc.spots.add();
  thisSpot.name = "WHITE UB";
  thisSpot.color = newCMYK;
  thisSpot.colorType = ColorModel.SPOT;

  // Move swatches back & delete swatch group
  var groupSwatches = swatchGroup.getAllSwatches();

  for (var i = 0; i < groupSwatches.length; i++) {
    doc.swatchGroups[0].addSwatch(groupSwatches[i]);
  }

  swatchGroup.remove();
}

// Run
try {
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "SP_Template") {
    SP_Add_SwatchUB();
  } else {
    throw new Error("SP Template File Not Active");
  }
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
}
