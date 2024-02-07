function SP_CMYK_SwatchConvert() {
  // Active Document
  var doc = app.activeDocument;

  // Spot colors in Document
  var docSpots = doc.spots;

  // Counter
  var processCounter = 0;

  // Change to spot color & add to counter
  for (var i = 0; i < docSpots.length; i++) {
    if (docSpots[i].colorType === ColorModel.PROCESS) {
      docSpots[i].colorType = ColorModel.SPOT;
      processCounter++;
    }
  }

  // Alerts
  if (processCounter > 0) {
    alert(processCounter + " Process Swatch" + (processCounter > 1 ? "es" : "") + " converted to Spot Color");
  } else {
    alert(processCounter + " Process Swatches found." + "\n\n" + "Proceed.");
  }
}

// Run
try {
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "SP_Template") {
    SP_CMYK_SwatchConvert();
  } else {
    throw new Error("SP Template File Not Active");
  }
} catch (e) {
  alert(e, "Script Alert", true);
}
