function SP_Set_MeshCounts() {
  // Active Document
  var doc = app.activeDocument;

  // Swatches
  var docSwatches = doc.swatches;

  // Mesh Counts
  var meshCounts = ["110", "125", "156", "156S", "180", "196", "230", "255"];

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
  doc.selection = false;

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
        meshDropdown.selection = 1;
      } else {
        meshDropdown.selection = 2;
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
        }
      }
    }

    // Close Mesh Window
    meshWindow.close();
  });

  // Show Mesh Window
  meshWindow.show();
}

// Run
try {
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "SP_Template") {
    SP_Set_MeshCounts();
  } else {
    throw new Error("SP Template File Not Active");
  }
} catch (e) {
  alert(e, "Script Alert", true);
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

    for (var i = 0; i < meshArray.length; i++) {
      if (meshArray[i] === lastText) {
        isMesh = true;
        newName = colorName.slice(0, lastSpace);
      }
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
