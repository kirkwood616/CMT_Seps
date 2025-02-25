//@include '../UTILITIES/Settings.jsx';

function AF_Open_ColorLibrary() {
  var settingsFile = setupSettingsFile("CMT_Seps_Settings", "Settings_Config.json");
  var settingsData = loadJSONData(settingsFile);
  var theFile = new File(settingsData.ColorLibrary_filePath);
  var openOptions = new OpenOptions();
  openOptions.openAs = LibraryType.SWATCHES;
  open(theFile, null, openOptions);
}

// Run
try {
  if (app.documents.length > 0) {
    AF_Open_ColorLibrary();
  } else {
    throw new Error("Error");
  }
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
}
