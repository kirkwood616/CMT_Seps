#include 'json2.js';

function NTF_Set_MeshCounts_Generate() {
  // Set up & load settings
  var settingsFile = setupSettingsFile("CMT_Seps_Settings", "Settings_Config.json");
  var settingsData = loadJSONData(settingsFile);

  // Active Document
  var doc = app.activeDocument;

  // Swatches
  var docSwatches = doc.swatches;

  // Mesh Counts
  var meshCounts = settingsData.meshCounts;
  var baseMeshIndex = meshCounts[0];

  for (var i = 0; i < meshCounts.length; i++) {
    var baseMesh = /^110$/;

    if (baseMesh.test(meshCounts[i])) baseMeshIndex = i;
  }

  // Storage
  var swatchColors = new Array();

  // Populate swatchColors[] with swatch names
  for (var i = 0; i < docSwatches.length; i++) {
    var currentSwatchName = docSwatches[i].name;

    // If space at end of name => remove
    if (currentSwatchName !== "[None]" && currentSwatchName !== "[Registration]") {
      if (currentSwatchName.charAt(currentSwatchName.length - 1) === " ") {
        var noEndingSpaceName = currentSwatchName.slice(0, -1);
        docSwatches[i].name = noEndingSpaceName;
      }
      swatchColors.push(currentSwatchName);
    }
  }

  // De-select everything
  doc.selection = null;

  // Select Mesh GUI window
  var meshWindow = createWindow("SET MESH COUNTS");
  var colorGroup = createGroup(meshWindow, "column");

  // Store for selected mesh & dropdown items
  var meshSelection = 0;
  var theDropdowns = new Array();

  // Create window contents
  for (var i = 0; i < swatchColors.length; i++) {
    // Swatch name
    var colorName = removeMeshSuffix(swatchColors[i], meshCounts);
    var colorMeshCount = extractMeshSuffix(swatchColors[i], meshCounts);

    // Color Panel
    var colorPanel = createPanel(colorGroup);
    colorPanel.alignChildren = "fill";

    // Color Order Number "button"
    var numberButton = createButton(colorPanel, i + 1);

    // Color Name Static Text
    var colorNameText = createStaticText(colorPanel, colorName);
    colorNameText.minimumSize = [225, 0];
    colorNameText.justify = "center";

    // Mesh Count Dropdown
    var meshDropdown = createDropdown(colorPanel, meshCounts);
    // Set Dropdown's default selection
    for (var j = 0; j < meshCounts.length; j++) {
      if (meshCounts[j] === colorMeshCount) {
        meshDropdown.selection = j;
        break;
      } else {
        meshDropdown.selection = baseMesh;
      }
    }

    // Add dropdown to store array
    theDropdowns.push(meshDropdown);

    // Change stores when selection changes on any dropdown
    meshDropdown.onChange = function () {
      meshSelection = this.selection.index;

      for (var k = 0; k < theDropdowns.length; k++) {
        theDropdowns[k].selection = meshSelection;
      }
    };

    // Button Control Group
    var buttonGroup = createGroup(meshWindow, "row");
    buttonGroup.alignChildren = "fill";
  }

  // Cancel Button
  var cancelButton = createButton(buttonGroup, "CANCEL", function () {
    meshWindow.close();
  });

  // OK Button
  var okButton = createButton(buttonGroup, "OK", function () {
    // Group of Color Panels
    var panelsGroup = meshWindow.children[0];

    // Color Panels
    var panelsOfColors = panelsGroup.children;

    // Loop over color selections & rename swatches with mesh suffix
    for (var i = 0; i < panelsOfColors.length; i++) {
      var panelChildren = panelsOfColors[i].children;

      for (var j = 0; j < docSwatches.length; j++) {
        var swatchName = removeMeshSuffix(docSwatches[j].name, meshCounts);

        if (swatchName === panelChildren[1].text) {
          docSwatches[j].name = swatchName + " M" + panelChildren[2].selection.text;
          break;
        }
      }
    }

    // Metadata Layer items
    var metadataLayer = doc.layers.getByName("Metadata");
    var metaGroup = metadataLayer.groupItems.getByName("MetaGroup");
    var metaTextFrames = metaGroup.textFrames;
    var metaDataGroups = metaGroup.groupItems;

    // Unlock Metadata layer
    metadataLayer.locked = false;

    // Storage
    var colorFrames = new Array();
    var swatchStorage = new Array();

    // Deselect everything
    doc.selection = null;

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
      var nameForMeta = editMetadataText(swatchStorage[i].name);

      colorFrames[i].name = "COLOR";
      colorFrames[i].contents = nameForMeta;
      colorFrames[i].textRange.characterAttributes.fillColor = swatchStorage[i].color;

      // Duplicate text frame if over 1 color
      if (i !== swatchStorage.length - 1) {
        var frameCopy = colorFrames[i].duplicate();
        colorFrames.push(frameCopy);
      }
    }

    // Boolean status for if COLOR COUNT group in Metadata
    var hasColorCount = false;

    // Deselect everything
    doc.selection = null;

    // Check for if COLOR COUNT group exists
    for (var i = 0; i < metaDataGroups.length; i++) {
      if (metaDataGroups[i].name === "_COLOR COUNT") {
        hasColorCount = true;
      }
    }

    // Exit if _COLOR COUNT group not found
    if (!hasColorCount) {
      throw new Error("'_COLOR COUNT' group not found in Metadata.");
    }

    // COLOR COUNT Group
    var colorCount = metaDataGroups.getByName("_COLOR COUNT");
    var colorCountTextFrames = colorCount.textFrames;

    // _COLOR COUNT groups & text frames
    var countGroup = colorCount.groupItems.getByName("_COUNT GROUP");
    var countGroupTextFrames = countGroup.textFrames;
    var ofCountText = colorCountTextFrames.getByName("_OF COUNT");

    // Remove all text frames except the first one
    if (countGroupTextFrames.length > 1) {
      for (var i = countGroupTextFrames.length; i--; ) {
        if (i !== 0) {
          countGroupTextFrames[i].remove();
        }
      }
    }

    // Add text frame numbers & color
    for (var i = 0; i < swatchStorage.length; i++) {
      countGroupTextFrames[i].name = (i + 1).toString();
      countGroupTextFrames[i].contents = (i + 1).toString();
      countGroupTextFrames[i].textRange.characterAttributes.fillColor = swatchStorage[i].color;

      // Duplicate text frame and arrange descending
      if (i !== swatchStorage.length - 1) {
        countGroupTextFrames[i].duplicate().zOrder(ZOrderMethod.BRINGTOFRONT);
      } else {
        countGroupTextFrames[i].zOrder(ZOrderMethod.BRINGTOFRONT);
      }
    }

    // Set of count with total color number
    ofCountText.contents = "of " + swatchStorage.length;

    // Lock Metadata layer
    metadataLayer.locked = true;

    // Close Mesh Window
    meshWindow.close();
  });

  // Show Mesh Window
  meshWindow.show();
}

// Run
try {
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "NTF_Template") {
    NTF_Set_MeshCounts_Generate();
  } else {
    throw new Error("Template File Not Active");
  }
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
}

//*******************
// Helper functions
//*******************

/**
 * Uses supplied folder and file name to pull settings from, or creates folder & file if they don't exist.
 * @param {string} folderName Name of folder
 * @param {string} fileName Name of file
 * @returns {File}
 */
function setupSettingsFile(folderName, fileName) {
  var settingsFolderPath = Folder.myDocuments + "/" + folderName;
  var settingsFolder = new Folder(settingsFolderPath);

  try {
    if (!settingsFolder.exists) {
      throw new Error("Settings folder doesn't exist." + "\n" + "Run 'CMT SEPS SETTINGS' and save your settings.");
    }

    var settingsFilePath = settingsFolder + "/" + fileName;
    var settingsFile = new File(settingsFilePath);

    if (!settingsFile.exists) {
      throw new Error("Settings file doesn't exist." + "\n" + "Run 'CMT SEPS SETTINGS' and save your settings.");
    }

    return new File(settingsFilePath);
  } catch (e) {
    throw new Error(e.message);
  }
}

/**
 * Parses a JSON file and returns the data as an object.
 * @param {File}      file JSON file
 * @returns {Object}  Parsed JSON data
 */
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
      throw new Error("Error loading Settings file.");
    }
  }
}

/**
 * Creates a GUI dialog window.
 * @param {String} title String to appear in window's top bar
 * @returns {Window}
 */
function createWindow(title) {
  var window = new Window("dialog", title);
  window.orientation = "column";
  // window.preferredSize.width = width;
  return window;
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
  return panel;
}

/**
 * Creates a static text item.
 * @param {Window|Group|Panel} parent Where to add statictext into
 * @param {String} text Text contents
 * @returns {StaticText}
 */
function createStaticText(parent, text) {
  var staticText = parent.add("statictext", undefined, text);
  return staticText;
}

/**
 * Creates a group item.
 * @param {Window|Group|Panel} parent Where to add group into
 * @param {String} orientation Orientation of the group
 * @returns {Group}
 */
function createGroup(parent, orientation) {
  var group = parent.add("group");
  group.orientation = orientation;
  return group;
}

// Create Window Dropdown
function createDropdown(parent, list) {
  var dropdown = parent.add("dropdownlist", undefined, list);
  return dropdown;
}

/**
 * Creates a clickable button.
 * @param {Window|Group|Panel} parent Where to add button into
 * @param {String} title Text to be shown inside of button
 * @param {() => void} [onClick] Callback function to run when button is clicked
 * @returns {Button}
 */
function createButton(parent, title, onClick) {
  var button = parent.add("button", undefined, title);
  if (onClick !== undefined) button.onClick = onClick;
  return button;
}

/**
 * Removes screen mesh indicator suffix (i.e. 'M156')
 * @param {String} colorName Name of color
 * @param {Array.<string>} meshArray Array of mesh counts (i.e. '156')
 * @returns {String}
 */
function removeMeshSuffix(colorName, meshArray) {
  var newName = "";
  var isMesh = false;
  var lastSpace = colorName.lastIndexOf(" ");

  if (colorName[lastSpace + 1] === "M") {
    var lastText = colorName.slice(lastSpace + 2, colorName.length);
    var meshDigits = parseInt(lastText.slice(0, 2));

    for (var i = 0; i < meshArray.length; i++) {
      if (meshArray[i] === lastText) {
        isMesh = true;
        newName = colorName.slice(0, lastSpace);
      }
    }

    if (!isNaN(meshDigits)) {
      isMesh = true;
      newName = colorName.slice(0, lastSpace);
    }
  }

  if (isMesh) {
    return newName;
  } else {
    return colorName;
  }
}

/**
 * Extracts screen mesh indicator suffix without preceeding 'M'
 * @param {String} colorName Name of color
 * @param {Array.<string>} meshArray Array of mesh counts (i.e. '156')
 * @returns {String}
 */
function extractMeshSuffix(colorName, meshArray) {
  var meshSuffix = "";
  var lastSpace = colorName.lastIndexOf(" ");

  if (colorName[lastSpace + 1] === "M") {
    var lastText = colorName.slice(lastSpace + 2, colorName.length);

    for (var i = 0; i < meshArray.length; i++) {
      if (meshArray[i] === lastText) {
        meshSuffix = lastText;
      }
    }
  }

  return meshSuffix;
}

/**
 * Remove unwanted characters from Metadata color text
 * @param {String} colorName - Spot swatch color name
 * @returns {String} Text with removed chars
 */
function editMetadataText(colorName) {
  // Remove any forward slashes from text
  var noForwardSlash = colorName.replace(/\//g, " ");

  // Remove "Spot" from text
  var noSpot = noForwardSlash.replace(/SPOT /gi, "");

  // Remove "PANTONE " from text
  var noPantone = noSpot.replace(/PANTONE /gi, "");

  // Remove parenthesis and contents contained between
  var noParenthesis = noPantone.replace(/\s*\(.*?\)\s*/g, " ");

  return noParenthesis;
}
