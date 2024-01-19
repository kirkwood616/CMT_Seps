function SP_CMYK_SwatchConvert() {
  // Active Document
  var doc = app.activeDocument;

  // Spot colors in Document
  var docSpots = doc.spots;

  // Metadata layer
  var metadataLayer = doc.layers.getByName("Metadata");

  // Counter
  var processCounter = 0;

  // Deselect everything
  doc.selection = false;

  // Unlock Metadata layer
  metadataLayer.locked = false;

  // Loop through Spots in reverse order
  for (var i = docSpots.length; i--; ) {
    // Current color in loop
    var currentColor = docSpots[i];

    // Check if spot is a Process Color & perform conversion
    if (currentColor.colorType === ColorModel.PROCESS) {
      // Add 1 to counter of found Process color
      processCounter++;

      // Get CMYK values of current color
      var colorCMYK = currentColor.getInternalColor();

      // Copy of found process color's CMYK values
      var newColorCMYK = new CMYKColor();
      newColorCMYK.cyan = colorCMYK[0];
      newColorCMYK.magenta = colorCMYK[1];
      newColorCMYK.yellow = colorCMYK[2];
      newColorCMYK.black = colorCMYK[3];

      // Add new Spot to palette w/ values
      var newSpot = docSpots.add();
      newSpot.name = "_" + currentColor.name;
      newSpot.colorType = ColorModel.SPOT;
      newSpot.color = newColorCMYK;

      // Declare new SpotColor and assign newSpot to value (only way this works)
      var newSpotColor = new SpotColor();
      newSpotColor.spot = newSpot;

      // Set default fill color to process swatch
      doc.defaultFillColor = doc.swatches[currentColor.name].color;

      // Select items colored with process swatch (default fill)
      app.executeMenuCommand("Find Fill Color menu item");

      // Change all selected items' color to newSpot via default fill color
      doc.defaultFillColor = doc.swatches[newSpot.name].color;

      // Deselect everything
      doc.selection = false;

      // Remove process swatch from palette
      currentColor.remove();

      // Remove leading character from newSpot name
      newSpot.name = newSpot.name.slice(1);
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
