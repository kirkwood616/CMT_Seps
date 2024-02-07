#include 'json2.js';

function SP_Settings() {
  // System
  var system = $.os.substring(0,3);
  var slash;

  if (system === "Mac") {
    slash = "/"
    $.writeln("\\")
  }
  if (system === "Win") {
    slash = "\\"
  }

  // Default settings
  var defaultSettings = {
    SP_templatePath: Folder.desktop + slash + "CMT_seps-main" + slash + "templates" + slash + "Quick Crosshairs.ait",
    SP_savePath: Folder.desktop + slash + "- WORKING DAY -" + slash,
    SP_proofTemplatePath: Folder.desktop + slash + "CMT_seps-main" + slash + "templates" + slash + "PAGE_PROOF.ait",
  };
  
  // Set up & load settings
  var settingsFile = setupSettingsFile("CMT_Seps_Settings", "SP_settings.json");
  var settingsData = settingsFile.exists ? loadJSONData(settingsFile) : defaultSettings;

  if (!settingsFile.exists) {
    writeSettings(defaultSettings, settingsFile);
  }

  // Window
  var settingsWindow = createWindow("SP Settings");

  // Template Panel
  var templatePanel = createPanel(settingsWindow, "Template File Path");
  var templateSelectButton = createButton(templatePanel, "Select", function () {
    var templateFilePath = File.openDialog();
    templatePath.text = templateFilePath.fullName;
  });
  var templatePathGroup = createGroup(templatePanel, "column");
  var templatePath = createEditText(templatePathGroup, settingsData.SP_templatePath);

  // Save Panel
  var savePanel = createPanel(settingsWindow, "Save Folder Path");
  var saveSelectButton = createButton(savePanel, "Select", function () {
    var saveFolderPath = Folder.selectDialog();
    savePath.text = saveFolderPath.fullName;
  });
  var savePathGroup = createGroup(savePanel, "column");
  var savePath = createEditText(savePathGroup, settingsData.SP_savePath);

  // PAGE PROOF Template Panel
  var proofTemplatePanel = createPanel(settingsWindow, "PAGE PROOF Template File Path");
  var proofSelectButton = createButton(proofTemplatePanel, "Select", function () {
    var proofTemplateFilePath = File.openDialog();
    proofTemplatePath.text = proofTemplateFilePath.fullName;
  });
  var proofTemplatePathGroup = createGroup(proofTemplatePanel, "column");
  var proofTemplatePath = createEditText(proofTemplatePathGroup, settingsData.SP_proofTemplatePath);

  // Buttons
  var buttonGroup = createGroup(settingsWindow, "row", "fill");
  buttonGroup.alignment = "center";
  var cancelButton = createButton(buttonGroup, "CANCEL", function () {
    settingsWindow.close();
  });
  var saveButton = createButton(buttonGroup, "SAVE", function () {
    settingsData.SP_templatePath = templatePath.text;
    settingsData.SP_savePath = savePath.text + slash;
    settingsData.SP_proofTemplatePath = proofTemplatePath.text
    writeSettings(settingsData, settingsFile);
    settingsWindow.close();
  });

  settingsWindow.show();
}

try {
  SP_Settings();
} catch (e) {
  alert(e, "Script Alert", true);
}

//*******************
// Helper functions
//*******************

function setupSettingsFile(folderName, fileName) {
  // setup save setting folder and file
  var settingsFolderPath = Folder.myDocuments + "/" + folderName;
  var settingsFolder = new Folder(settingsFolderPath);
  if (!settingsFolder.exists) settingsFolder.create();
  var settingsFilePath = settingsFolder + "/" + fileName;
  return new File(settingsFilePath);
}

// load settings if available
function loadJSONData(file) {
  if (file.exists) {
    try {
      file.encoding = "UTF-8";
      file.open("r");
      var data = file.read();
      file.close();
      data = JSON.parse(data);
      return data;
    } catch (e) {
      ("Error loading Settings file.");
    }
  }
}

function writeSettings(data, file) {
  try {
    file.encoding = "UTF-8";
    file.open("w");
    file.write(JSON.stringify(data));
    file.close();
  } catch (e) {
    ("Error saving Settings file.");
  }
}

function getObjectKeys(obj) {
  var keys = [];
  for (var k in obj) {
    keys.push(k);
  }
  return keys;
}

/**
 * Creates a GUI dialog window.
 * @param {String} title String to appear in window's top bar
 * @param {Number} [width] Width of window
 * @returns {Window}
 */
function createWindow(title, width) {
  var window = new Window("dialog", title);
  window.orientation = "column";
  window.alignChildren = "fill";
  window.preferredSize.width = width;
  return window;
}

/**
 * Creates a group item.
 * @param {Window|Group|Panel} parent Where to add group into
 * @param {String} orientation Orientation of the group
 * @param {String} [align] Alignment of group's children
 * @returns {Group}
 */
function createGroup(parent, orientation, align) {
  var group = parent.add("group");
  group.orientation = orientation;
  group.alignChildren = align;
  return group;
}

/**
 * Creates a panel item.
 * @param {Window|Group} parent Where to add panel into
 * @param {String} [title] Text for panel's upper-left title
 * @returns {Panel}
 */
function createPanel(parent, title) {
  var panel = parent.add("panel", undefined, title);
  panel.orientation = "row";
  panel.margins = 20;
  return panel;
}

/**
 * Creates a edit text item.
 * @param {Window|Group|Panel} parent Where to add edittext into
 * @param {String} text Text contents
 * @returns {EditText}
 */
function createEditText(parent, text) {
  var editText = parent.add("edittext", undefined, text, {readonly: true})
  editText.preferredSize.width = 500;

  return editText;
}

/**
 * Creates a clickable button.
 * @param {Window|Group|Panel} parent Where to add button into
 * @param {any} title Text to be shown inside of button
 * @param {() => void} [onClick] Callback function to run when button is clicked
 * @returns {Button}
 */
function createButton(parent, title, onClick) {
  var button = parent.add("button", undefined, title);
  if (onClick !== undefined) button.onClick = onClick;
  return button;
}
