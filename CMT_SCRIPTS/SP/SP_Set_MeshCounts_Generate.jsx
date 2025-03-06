//@include '../UTILITIES/Settings.jsx';
//@include '../UTILITIES/FormatText.jsx';
//@include '../UTILITIES/Polyfills.js';

function SP_Set_MeshCounts_Generate() {
  // Set up & load settings
  var settingsFile = setupSettingsFile("CMT_Seps_Settings", "Settings_Config.json");
  var settingsData = loadJSONData(settingsFile);

  // Active Document
  var doc = app.activeDocument;

  // Swatches
  var docSwatches = doc.swatches;

  // Remove unwanted items from all swatch names
  formatSwatchNames();

  // Mesh Counts
  var meshCounts = settingsData.meshCounts;
  var baseMeshIndex = meshCounts[1];
  var stdMeshIndex = meshCounts[1];

  for (var i = 0; i < meshCounts.length; i++) {
    var baseMesh = /^125$/;
    var stdMesh = /^156$/;

    if (baseMesh.test(meshCounts[i])) baseMeshIndex = i;
    if (stdMesh.test(meshCounts[i])) stdMeshIndex = i;
  }

  // Storage
  var swatchColors = new Array();

  // Populate swatchColors[] with swatch names
  for (var i = 0; i < docSwatches.length; i++) {
    if (docSwatches[i].name !== "[None]" && docSwatches[i].name !== "[Registration]") {
      swatchColors.push(docSwatches[i].name);
    }
  }

  // Deselect everything
  doc.selection = null;

  // Select Mesh GUI window
  var meshWindow = createWindow("SET MESH COUNTS");
  var colorGroup = createGroup(meshWindow, "column");

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
      } else if (colorName.indexOf("WHITE UB") !== -1) {
        meshDropdown.selection = baseMeshIndex;
      } else {
        meshDropdown.selection = stdMeshIndex;
      }
    }

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

    // Storage
    var colorFrames = new Array();
    var swatchStorage = new Array();

    // Unlock Metadata layer
    metadataLayer.locked = false;

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
      var nameForMeta = removeUnwantedChars(swatchStorage[i].name);

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

    // Unlock Metadata layer
    metadataLayer.locked = false;

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

    // Close Mesh Window
    meshWindow.close();
  });

  // Show Mesh Window
  meshWindow.show();
}

// Run
try {
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "SP_Template") {
    SP_Set_MeshCounts_Generate();
  } else {
    throw new Error("SP Template File Not Active");
  }
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
}

//*******************
// Helper functions
//*******************

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
