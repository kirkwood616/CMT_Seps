#include 'json2.js';

function Settings_Config() {
  // System
  var system = $.os.substring(0, 3);
  var slash;

  if (system === "Mac") {
    slash = "/";
  }
  if (system === "Win") {
    slash = "\\";
  }

  // Default settings
  var defaultSettings = {
    SP_templatePath: Folder.desktop + slash + "CMT_seps-main" + slash + "templates" + slash + "SP_Template.ait",
    SP_savePath: Folder.desktop + slash + "- WORKING DAY -" + slash,
    SP_proofTemplatePath: Folder.desktop + slash + "CMT_seps-main" + slash + "templates" + slash + "PAGE_PROOF.ait",
    SP_proofTemplateSavePath: Folder.desktop + slash + "- WORKING DAY -" + slash,
    NTF_templatePath: Folder.desktop + slash + "CMT_seps-main" + slash + "templates" + slash + "NTF_Template.ait",
    NTF_savePath: Folder.desktop + slash + "- WORKING DAY -" + slash,
    NTF_proofTemplatePath: Folder.desktop + slash + "CMT_seps-main" + slash + "templates" + slash + "NTF_Cut_Proof.ait",
    NTF_proofTemplateSavePath: Folder.desktop + slash + "- WORKING DAY -" + slash,
    RTF_templatePath: Folder.desktop + slash + "CMT_seps-main" + slash + "templates" + slash + "RTF_Template.ait",
    RTF_savePath: Folder.desktop + slash + "- WORKING DAY -" + slash,
    meshCounts: ["086", "110", "125", "156", "180", "196", "230", "255", "280", "305"],
  };

  // Set up & load settings
  var settingsFile = setupSettingsFile("CMT_Seps_Settings", "Settings_Config.json");
  var settingsData = settingsFile.exists ? loadJSONData(settingsFile) : defaultSettings;

  if (!settingsFile.exists) {
    writeSettings(defaultSettings, settingsFile);
  }

  // DIALOG WINDOW
  // ======
  var dialog = new Window("dialog", undefined, undefined, { closeButton: false });
  dialog.text = "CMT SEP SETTINGS";
  dialog.preferredSize.width = 600;
  dialog.preferredSize.height = 350;
  dialog.orientation = "column";
  dialog.alignChildren = ["left", "top"];
  dialog.spacing = 10;
  dialog.margins = 25;

  // VERTICALTABBEDPANEL1
  // ====================
  var verticaltabbedpanel1 = dialog.add("group", undefined, undefined, { name: "verticaltabbedpanel1" });
  verticaltabbedpanel1.alignChildren = ["left", "fill"];
  var verticaltabbedpanel1_nav = verticaltabbedpanel1.add("listbox", undefined, ["SP", "NTF", "RTF", "MESH"]);
  verticaltabbedpanel1_nav.preferredSize.width = 73;
  var verticaltabbedpanel1_innerwrap = verticaltabbedpanel1.add("group");
  verticaltabbedpanel1_innerwrap.alignment = ["fill", "fill"];
  verticaltabbedpanel1_innerwrap.orientation = ["stack"];
  verticaltabbedpanel1.preferredSize.width = 600;
  verticaltabbedpanel1.alignment = ["fill", "top"];

  // TAB1 - SP
  // ====
  var SP_tab = createTabGroup(verticaltabbedpanel1_innerwrap, "SP");

  // PANEL1
  // ======
  var SP_panel__templatePath = createFilePanel(SP_tab, "SP TEMPLATE FILE PATH");

  var SP_templatePath__button = createButton(SP_panel__templatePath, "Select", function () {
    var SP_TFP = File.openDialog();
    SP_templatePath__path.text = SP_TFP.fullName;
  });

  var SP_templatePath__path = createFileText(SP_panel__templatePath, settingsData.SP_templatePath);

  // PANEL2
  // ======
  var SP_panel__templateSavePath = createFilePanel(SP_tab, "SP SAVE FOLDER PATH");

  var SP_templateSavePath__button = createButton(SP_panel__templateSavePath, "Select", function () {
    var SP_TSP = Folder.selectDialog();
    SP_templateSavePath__path.text = SP_TSP.fullName;
  });

  var SP_templateSavePath__path = createFileText(SP_panel__templateSavePath, settingsData.SP_savePath);

  // PANEL3
  // ======
  var SP_panel__proofPath = createFilePanel(SP_tab, "SP PROOF TEMPLATE FILE PATH");

  var SP_proofPath__button = createButton(SP_panel__proofPath, "Select", function () {
    var SP_PFP = File.openDialog();
    SP_proofPath__path.text = SP_PFP.fullName;
  });

  var SP_proofPath__path = createFileText(SP_panel__proofPath, settingsData.SP_proofTemplatePath);

  // PANEL4
  // ======
  var SP_panel__proofSavePath = createFilePanel(SP_tab, "SP PROOF TEMPLATE SAVE PATH");

  var SP_proofSavePath__button = createButton(SP_panel__proofSavePath, "Select", function () {
    var SP_PSP = Folder.selectDialog();
    SP_proofSavePath__path.text = SP_PSP.fullName;
  });

  var SP_proofSavePath__path = createFileText(SP_panel__proofSavePath, settingsData.SP_proofTemplateSavePath);

  // TAB2 - NTF
  // ====
  var NTF_tab = createTabGroup(verticaltabbedpanel1_innerwrap, "NTF");

  // PANEL5
  // ======
  var NTF_panel__templatePath = createFilePanel(NTF_tab, "NTF TEMPLATE FILE PATH");

  var NTF_templatePath__button = createButton(NTF_panel__templatePath, "Select", function () {
    var NTF_TFP = File.openDialog();
    NTF_templatePath__path.text = NTF_TFP.fullName;
  });

  var NTF_templatePath__path = createFileText(NTF_panel__templatePath, settingsData.NTF_templatePath);

  // PANEL6
  // ======
  var NTF_panel__templateSavePath = createFilePanel(NTF_tab, "NTF SAVE FOLDER PATH");

  var NTF_templateSavePath__button = createButton(NTF_panel__templateSavePath, "Select", function () {
    var NTF_TSP = Folder.selectDialog();
    NTF_templateSavePath__path.text = NTF_TSP.fullName;
  });

  var NTF_templateSavePath__path = createFileText(NTF_panel__templateSavePath, settingsData.NTF_proofTemplateSavePath);

  // PANEL7
  // ======
  var NTF_panel__proofPath = createFilePanel(NTF_tab, "NTF PROOF TEMPLATE FILE PATH");

  var NTF_proofPath__button = createButton(NTF_panel__proofPath, "Select", function () {
    var NTF_PFP = File.openDialog();
    NTF_proofPath__path.text = NTF_PFP.fullName;
  });

  var NTF_proofPath__path = createFileText(NTF_panel__proofPath, settingsData.NTF_proofTemplatePath);

  // PANEL8
  // ======
  var NTF_panel__proofSavePath = createFilePanel(NTF_tab, "NTF PROOF TEMPLATE SAVE PATH");

  var NTF_proofSavePath__button = createButton(NTF_panel__proofSavePath, "Select", function () {
    var NTF_PSP = Folder.selectDialog();
    NTF_proofSavePath__path.text = NTF_PSP.fullName;
  });

  var NTF_proofSavePath__path = createFileText(NTF_panel__proofSavePath, settingsData.NTF_proofTemplateSavePath);

  // TAB3 - RTF
  // ====
  var RTF_tab = createTabGroup(verticaltabbedpanel1_innerwrap, "RTF");

  // PANEL9
  // ======
  var RTF_panel__templatePath = createFilePanel(RTF_tab, "RTF TEMPLATE FILE PATH");

  var RTF_templatePath__button = createButton(RTF_panel__templatePath, "Select", function () {
    var RTF_TFP = File.openDialog();
    RTF_templatePath__path.text = RTF_TFP.fullName;
  });

  var RTF_templatePath__path = createFileText(RTF_panel__templatePath, settingsData.RTF_templatePath);

  // PANEL10
  // =======
  var RTF_panel__templateSavePath = createFilePanel(RTF_tab, "RTF SAVE FOLDER PATH");

  var RTF_templateSavePath__button = createButton(RTF_panel__templateSavePath, "Select", function () {
    var RTF_TSP = Folder.selectDialog();
    RTF_templateSavePath__path.text = RTF_TSP.fullName;
  });

  var RTF_templateSavePath__path = createFileText(RTF_panel__templateSavePath, settingsData.RTF_savePath);

  // TAB4 - MESH
  // ====
  var MESH_tab = createTabGroup(verticaltabbedpanel1_innerwrap, "MESH");

  // VERTICALTABBEDPANEL1
  // ====================
  verticaltabbedpanel1_tabs = [SP_tab, NTF_tab, RTF_tab, MESH_tab];

  for (var i = 0; i < verticaltabbedpanel1_tabs.length; i++) {
    verticaltabbedpanel1_tabs[i].alignment = ["fill", "fill"];
    verticaltabbedpanel1_tabs[i].visible = false;
  }

  verticaltabbedpanel1_nav.onChange = showTab_verticaltabbedpanel1;

  function showTab_verticaltabbedpanel1() {
    if (verticaltabbedpanel1_nav.selection !== null) {
      for (var i = verticaltabbedpanel1_tabs.length - 1; i >= 0; i--) {
        verticaltabbedpanel1_tabs[i].visible = false;
      }
      verticaltabbedpanel1_tabs[verticaltabbedpanel1_nav.selection.index].visible = true;
    }
  }

  verticaltabbedpanel1_nav.selection = 0;
  showTab_verticaltabbedpanel1();

  // GROUP1
  // ======
  var MESH_group = MESH_tab.add("group", undefined, { name: "MESH_group" });
  MESH_group.orientation = "column";
  MESH_group.alignChildren = ["left", "center"];
  MESH_group.spacing = 10;
  MESH_group.margins = 0;
  MESH_group.alignment = ["center", "top"];

  for (var i = 0; i < defaultSettings.meshCounts.length; i++) {
    var isMeshChecked = false;

    for (var j = 0; j < settingsData.meshCounts.length; j++) {
      if (settingsData.meshCounts[j] == defaultSettings.meshCounts[i]) {
        isMeshChecked = true;
      }
    }

    var meshCheckbox = createCheckbox(MESH_group, defaultSettings.meshCounts[i], isMeshChecked);
  }

  // GROUP3
  // ======
  var buttonGroup = dialog.add("group", undefined, { name: "buttonGroup" });
  buttonGroup.orientation = "row";
  buttonGroup.alignChildren = ["center", "fill"];
  buttonGroup.spacing = 10;
  buttonGroup.margins = [2, 18, 2, 2];
  buttonGroup.alignment = ["fill", "top"];

  var cancelButton = createButton(buttonGroup, "CANCEL", function () {
    dialog.close();
  });

  var saveButton = createButton(buttonGroup, "SAVE", function () {
    // File Paths
    settingsData.SP_templatePath = SP_templatePath__path.text;
    settingsData.SP_savePath = SP_templateSavePath__path.text;
    settingsData.SP_proofTemplatePath = SP_proofPath__path.text;
    settingsData.SP_proofTemplateSavePath = SP_proofSavePath__path.text;
    settingsData.NTF_templatePath = NTF_templatePath__path.text;
    settingsData.NTF_savePath = NTF_templateSavePath__path.text;
    settingsData.NTF_proofTemplatePath = NTF_proofPath__path.text;
    settingsData.NTF_proofTemplateSavePath = NTF_proofSavePath__path.text;
    settingsData.RTF_templatePath = RTF_templatePath__path.text;
    settingsData.RTF_savePath = RTF_templateSavePath__path.text;

    // Mesh
    var checkedMeshes = new Array();

    for (var i = 0; i < MESH_group.children.length; i++) {
      if (MESH_group.children[i].value) {
        checkedMeshes.push(MESH_group.children[i].text);
      }
    }

    checkedMeshes.sort();

    settingsData.meshCounts = checkedMeshes;

    // Save settings & close Dialog Windowe
    writeSettings(settingsData, settingsFile);
    dialog.close();
  });

  // Show Dialog Window
  dialog.show();
}

// Run
try {
  Settings_Config();
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
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
 * Creates a tab group in a group for a list.
 * @param {Group}   parent Where to add tab into
 * @param {string}  name Text contents
 * @returns {Group}
 */
function createTabGroup(parent, name) {
  var tab = parent.add("group", undefined, { name: "tab_" + name });
  tab.text = name;
  tab.orientation = "column";
  tab.alignChildren = ["fill", "top"];
  tab.spacing = 10;
  tab.margins = 0;

  return tab;
}

/**
 * Creates a panel for file path input
 * @param {Window|Group|Panel}  parent Where to add the panel into
 * @param {string}              text Text contents of panel header
 * @returns {Panel}
 */
function createFilePanel(parent, text) {
  var panel = parent.add("panel", undefined, text, { name: "panel_" + text.replace(" ", "") });
  panel.orientation = "row";
  panel.alignChildren = ["left", "fill"];
  panel.spacing = 10;
  panel.margins = 10;
  panel.alignment = ["left", "top"];

  return panel;
}

/**
 * Creates a clickable button.
 * @param {Window|Group|Panel}  parent Where to add button into
 * @param {any}                 title Text to be shown inside of button
 * @param {() => void}          [onClick] Callback function to run when button is clicked
 * @returns {Button}
 */
function createButton(parent, title, onClick) {
  var button = parent.add("button", undefined, title);
  if (onClick !== undefined) button.onClick = onClick;
  return button;
}

/**
 * Creates an edittext item for file paths that is readonly.
 * @param {Window|Group|Panel}  parent Where to add edittext into
 * @param {string}              text Text contents
 * @returns {EditText}
 */
function createFileText(parent, text) {
  var editText = parent.add("edittext", undefined, text, { readonly: true });
  editText.preferredSize.width = 500;
  editText.alignment = ["left", "fill"];

  return editText;
}

/**
 * Creates a checkbox item with supplied text & checked value.
 * @param {Window|Group|Panel}  parent Where to add checkbox into
 * @param {string}              text Text contents next to checkbox
 * @param {boolean}             isChecked If box is or isn't checked
 * @returns {Checkbox}
 */
function createCheckbox(parent, text, isChecked) {
  var checkbox = parent.add("checkbox", undefined, text);
  checkbox.value = isChecked;

  return checkbox;
}
