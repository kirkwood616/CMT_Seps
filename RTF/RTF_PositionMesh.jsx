//@include '../UTILITIES/json2.js';
//@include '../UTILITIES/FormatText.jsx';

function RTF_PositionMesh() {
  // Set up & load settings
  var settingsFile = setupSettingsFile("CMT_Seps_Settings", "Settings_Config.json");
  var settingsData = loadJSONData(settingsFile);

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
  var meshCounts = settingsData.meshCounts;
  var baseMeshIndex = meshCounts[0];

  for (var i = 0; i < meshCounts.length; i++) {
    var baseMesh = /^110$/;

    if (baseMesh.test(meshCounts[i])) baseMeshIndex = i;
  }

  // Storage Variables
  var artColors = new Array();
  var colorSettings = new Array();
  var isCanceled = false;

  // Populate artColors[] with swatch names
  for (var i = 0; i < docSwatches.length; i++) {
    var swatchName = docSwatches[i].name;

    if (swatchName !== "[None]" && swatchName !== "[Registration]") {
      artColors.push(swatchName);
    }
  }

  // Populate colorSettings[]
  for (var i = 0; i < artColors.length; i++) {
    var settingsObject = {
      colorName: "",
      colorPosition: i,
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

  // Populate Control Panels
  for (var i = 0; i < artColors.length; i++) {
    // Color Panel
    var colorPanel = createPanel(colorGroup);
    colorPanel.alignChildren = "fill";

    // Position "button"
    var positionButton = createButton(colorPanel, i + 1);

    // Color Name Dropdown
    var colorDropdown = createDropdown(colorPanel, artColors);
    colorDropdown.minimumSize = [225, 0];
    colorDropdown.selection = i;
    colorDropdown.onChange = function () {
      colorSettings[i].colorName = this.selection.text;
    };

    // Color Mesh Count Dropdown
    var meshDropdown = createDropdown(colorPanel, meshCounts);
    meshDropdown.selection = baseMeshIndex;
    meshDropdown.onChange = function () {
      colorSettings[i].colorMesh = this.selection.text;
    };
  }

  // Button Control Group
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
      colorSettings[i].colorName = panelChildren[1].selection.text;
      colorSettings[i].colorMesh = panelChildren[2].selection.text;
    }

    // Check for if colorName duplicate values exist
    var hasDuplicates = hasNameDuplicates(colorSettings);

    if (hasDuplicates) {
      alert("DUPLICATE COLORS SELECTED\nFix Errors", "Script Alert", true);
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

    // Rename spot colors
    for (var j = 0; j < docSpots.length; j++) {
      if (docSpots[j].name !== "[Registration]" && docSpots[j].name === colorSettings[i].colorName) {
        docSpots[j].name = newName.slice(2);
      }
    }

    // Rename color groups
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
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
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

// Checks colorSettings[] for colorName duplicates
function hasNameDuplicates(array) {
  // Names storage array
  var namesList = [];

  // Add colorPositions to namesList[]
  for (var i = 0; i < array.length; i++) {
    namesList.push(array[i].colorName);
  }

  // Boolean status for if duplicates found
  var hasDuplicates = false;

  // Loop over namesList[]
  for (var i = 0; i < namesList.length; i++) {
    // Nested for loop
    for (var j = 0; j < namesList.length; j++) {
      // Prevents the element from comparing with itself
      if (i !== j) {
        // Check if elements' values are equal
        if (namesList[i] === namesList[j]) {
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
