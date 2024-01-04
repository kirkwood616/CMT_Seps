function RTF_PositionMesh() {
  // Active Document
  var doc = app.activeDocument;

  // Transfer Art Layer
  var artLayer = doc.layers.getByName("Transfer Art");

  // Groups in Transfer Art Layer
  var artLayerGroups = artLayer.groupItems;

  // Swatches & Spots in Active Document
  var docSwatches = doc.swatches;
  var docSpots = doc.spots;

  // Mesh Counts
  var meshCounts = ["110", "125", "156", "156S", "180", "196", "230", "255"];

  // Storage Variables
  var artColors = new Array();
  var colorCount = new Array();
  var colorSettings = new Array();
  var isCanceled = false;

  // Populate artColors[] with art swatch names
  for (var i = 0; i < docSwatches.length; i++) {
    var swatchName = docSwatches[i].name;

    if (swatchName !== "[None]" && swatchName !== "[Registration]") {
      artColors.push(swatchName);
    }
  }

  // Populate colorCount[] for dropdown
  for (var i = 0; i < artColors.length; i++) {
    colorCount.push(i + 1);
  }

  // Populate colorSettings[]
  for (i = 0; i < artColors.length; i++) {
    var settingsObject = {
      colorName: artColors[i],
      colorPosition: undefined,
      colorMesh: "",
    };

    colorSettings.push(settingsObject);
  }

  // GUI Window
  var gui = new Window("dialog", "SET COLOR INFO");
  gui.center();
  gui.orientation = "column";

  // GUI Title Instructions
  gui.add("statictext", undefined, "Set color order and mesh counts.");

  // Group of Color Panels
  var colorGroup = createGroup(gui, "column");
  colorGroup.name = "colorGroup";

  // Loop and populate swatch groups
  for (var i = 0; i < artColors.length; i++) {
    // Current Color name
    var currentSwatchName = artColors[i];

    // Color Panel
    var colorPanel = createPanel(colorGroup);
    colorPanel.alignChildren = "fill";

    // Color Position Dropdown
    var colorDropdown = createDropdown(colorPanel, colorCount);
    colorDropdown.selection = [i];
    colorDropdown.onChange = function () {
      colorSettings[i].colorPosition = this.selection.index;
    };

    // Color Name (static text)
    var colorText = colorPanel.add("statictext", undefined, currentSwatchName);
    colorText.justify = "center";
    colorText.minimumSize = [175, 0];

    // Color Mesh Count Dropdown
    var meshDropdown = createDropdown(colorPanel, meshCounts);
    meshDropdown.selection = 0;
    meshDropdown.onChange = function () {
      colorSettings[i].colorMesh = this.selection.text;
    };
  }

  // Button Group
  var buttonGroup = createGroup(gui, "row");
  buttonGroup.alignChildren = "fill";

  // Cancel Button
  var cancelButton = createButton(buttonGroup, "CANCEL", function () {
    isCanceled = true;
    gui.close();
  });

  // OK Button
  var okButton = createButton(buttonGroup, "OK", function () {
    // Group of Color Panels
    var panelsGroup = gui.children[1];

    // Color Panels
    var panelsOfColors = panelsGroup.children;

    // Loop over color selections, make settingsObject & add to colorSettings
    for (var i = 0; i < panelsOfColors.length; i++) {
      var panelChildren = panelsOfColors[i].children;
      colorSettings[i].colorPosition = panelChildren[0].selection.index;
      colorSettings[i].colorName = panelChildren[1].text;
      colorSettings[i].colorMesh = panelChildren[2].selection.text;
    }

    // Boolean check for if colorPosition duplicate values exist
    var hasDuplicates = hasPositionDuplicates(colorSettings);

    if (hasDuplicates) {
      alert("DUPLICATE COLOR POSITIONS\nFix Errors", "Script Alert", true);
    } else {
      gui.close();
    }
  });

  // Show GUI
  gui.show();

  // Exit if CANCEL button is pressed
  if (isCanceled) {
    return;
  }

  // Add Color Position & Mesh to Swatch Name
  for (var i = 0; i < colorSettings.length; i++) {
    var position = colorSettings[i].colorPosition + 1;
    var name = removeMeshSuffix(colorSettings[i].colorName, meshCounts);
    var mesh = colorSettings[i].colorMesh;
    var newName = position + " " + name.replace(/\//g, " ") + " " + "M" + mesh;

    // Loop & rename spot colors
    for (var j = 0; j < docSpots.length; j++) {
      if (docSpots[j].name !== "[Registration]" && docSpots[j].name === colorSettings[i].colorName) {
        docSpots[j].name = newName.slice(2);
      }
    }

    // Loop & rename color groups
    for (var k = 0; k < artLayerGroups.length; k++) {
      if (name === removeMeshSuffix(artLayerGroups[k].name, meshCounts)) {
        artLayerGroups[k].name = newName;
      }
    }
  }
}

// Run
try {
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "RTF_Template") {
    RTF_PositionMesh();
  } else {
    throw new Error("RTF Template File Not Active");
  }
} catch (e) {
  alert(e, "Script Alert", true);
}

//*******************
// Helper functions
//*******************

// Create Window Panel
function createPanel(parent, title) {
  var panel = parent.add("panel", undefined, title);
  panel.orientation = "row";
  return panel;
}

// Create Window Group
function createGroup(parent, orientation) {
  var group = parent.add("group");
  group.orientation = orientation;
  return group;
}

// Create Window Button
function createButton(parent, title, onClick) {
  var button = parent.add("button", undefined, title);
  if (onClick !== undefined) button.onClick = onClick;
  return button;
}

// Create Window Dropdown
function createDropdown(parent, list) {
  var dropdown = parent.add("dropdownlist", undefined, list);
  return dropdown;
}

// Checks colorSettings[] for colorPosition duplicates
function hasPositionDuplicates(array) {
  // Position storage array
  var positionList = [];

  // Add colorPositions to positionList[]
  for (var i = 0; i < array.length; i++) {
    positionList.push(array[i].colorPosition);
  }

  // Boolean status for if duplicates found
  var hasDuplicates = false;

  // Loop over positionList[]
  for (var i = 0; i < positionList.length; i++) {
    // Nested for loop
    for (var j = 0; j < positionList.length; j++) {
      // Prevents the element from comparing with itself
      if (i !== j) {
        // Check if elements' values are equal
        if (positionList[i] === positionList[j]) {
          // Set hasDuplicates if equal & terminate inner loop
          hasDuplicates = true;
          break;
        }
      }
    }
    // Terminate outer loop if duplicates found
    if (hasDuplicates) {
      break;
    }
  }

  return hasDuplicates;
}

/**
 *
 * @param {String} colorName Name of color
 * @returns {String} Color name with mesh suffix removed or original color name
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
