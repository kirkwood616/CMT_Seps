//@include '../UTILITIES/Settings.jsx';

function SP_PageProof_Open_Template() {
  // Set up & load settings
  var settingsFile = setupSettingsFile("CMT_Seps_Settings", "Settings_Config.json");
  var settingsData = loadJSONData(settingsFile);
  var filePath = settingsData.SP_proofTemplatePath;

  // Open template document
  app.open(new File(filePath));
}

// Run
try {
  SP_PageProof_Open_Template();
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
}
