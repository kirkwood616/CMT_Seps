//@include '../UTILITIES/Settings.jsx';

function DTF_Open_Template() {
  // Set up & load settings
  var settingsFile = setupSettingsFile(
    "CMT_Seps_Settings",
    "Settings_Config.json",
  );
  var settingsData = loadJSONData(settingsFile);
  var filePath = settingsData.DTF_templatePath;

  // Open template document
  app.open(new File(filePath));
}

// Run
try {
  DTF_Open_Template();
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
}
