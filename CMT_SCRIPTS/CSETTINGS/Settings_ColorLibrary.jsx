//@include '../UTILITIES/Settings.jsx';

function Settings_ColorLibrary() {
  // Set up & load Settings_Config file
  var settingsFile = setupSettingsFile("CMT_Seps_Settings", "Settings_Config.json");
  var settingsData = loadJSONData(settingsFile);
  var filePath = settingsData.ColorLibrary_filePath;

  // Open Color Library file
  app.open(new File(filePath));

  // Color Library Doc
  var doc = app.activeDocument;
  var docSpots = doc.spots;

  // Color Data storage (Object Array)
  var colorData = new Array();

  // Search Spot Colors, get color info, add to storage
  for (var i = 0; i < docSpots.length; i++) {
    if (docSpots[i].name === "[Registration]") continue;

    var colorInfo = { name: docSpots[i].name, kind: "", values: docSpots[i].getInternalColor() };

    switch (docSpots[i].spotKind) {
      case SpotColorKind.SPOTLAB:
        colorInfo.kind = "LAB";
        colorData.push(colorInfo);
        break;

      case SpotColorKind.SPOTRGB:
        colorInfo.kind = "RGB";
        colorData.push(colorInfo);
        break;

      case SpotColorKind.SPOTCMYK:
        colorInfo.kind = "CMYK";
        colorData.push(colorInfo);

      default:
        break;
    }
  }

  // Settings File
  var colorLibraryFile = configSettingsFile("CMT_Seps_Settings", "Settings_ColorLibrary.json");

  // Save to Settings_ColorLibrary file
  writeSettings(colorData, colorLibraryFile);

  // Alert Success
  alert("Color Library Settings Successful!\n\nDocument will close.");

  // Close file
  doc.close(SaveOptions.DONOTSAVECHANGES);
}

// Run
try {
  if (app.documents.length > 0) {
    Settings_ColorLibrary();
  } else {
    throw new Error("Error");
  }
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
}
