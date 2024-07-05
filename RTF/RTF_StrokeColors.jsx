function RTF_StrokeColors() {
  // Active Document
  var doc = app.activeDocument;

  // Transfer Art Layer
  var artLayer = doc.layers.getByName("Transfer Art");

  // Groups in Transfer Art Layer
  var transferArtGroup = artLayer.groupItems.getByName("ArtGroup");
  var colorGroups = transferArtGroup.groupItems;

  // Storage Variables
  var artColors = new Array();
  var colorsToStroke = new Array();
  var isCanceled = false;

  // Populate artColors with names of colorGroups
  for (var i = 0; i < colorGroups.length; i++) {
    artColors.push(colorGroups[i].name);
  }

  // GUI Window
  var gui = new Window("dialog", "SET STROKED COLORS");
  gui.center();
  gui.orientation = "column";

  // GUI Title Instructions
  gui.add("statictext", undefined, "Check the boxes next to the color(s) you want to stroke.");

  // Group of Color Panels
  var listGroup = createGroup(gui, "column");
  listGroup.name = "listGroup";

  // Populate checkboxes & names from artColors
  for (var i = 0; i < artColors.length; i++) {
    var currentSwatchName = artColors[i];
    var colorCheckbox = createCheckbox(listGroup, currentSwatchName);
    colorCheckbox.value = false;
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
    // Add checked color names to storage array
    for (var i = 0; i < listGroup.children.length; i++) {
      var listColor = listGroup.children[i];

      if (listColor.value) {
        colorsToStroke.push(listGroup.children[i].text);
      }
    }
    gui.close();
  });

  // Show GUI
  gui.show();

  // Exit if CANCEL button is pressed
  if (isCanceled) {
    return;
  }

  // Loop colorGroups & determine if last group
  for (var i = 0; i < colorGroups.length; i++) {
    var currentGroup = colorGroups[i];
    var isLastGroup = i === colorGroups.length - 1 ? true : false;

    // Loop colorsToStroke
    for (var j = 0; j < colorsToStroke.length; j++) {
      var toStrokeName = colorsToStroke[j];

      // Check if group is in colorsToStroke
      if (currentGroup.name === toStrokeName) {
        // Loop group's path items & apply stroke
        for (var l = 0; l < currentGroup.pathItems.length; l++) {
          var currentPath = currentGroup.pathItems[l];

          currentPath.strokeColor = currentPath.fillColor;
          currentPath.strokeOverprint = true;
          currentPath.strokeMiterLimit = 50;
          currentPath.strokeWidth = isLastGroup ? 0.25 : 0.35;
        }

        // Loop group's compound paths
        for (var m = 0; m < currentGroup.compoundPathItems.length; m++) {
          var currentCompound = currentGroup.compoundPathItems[m];

          // Loop paths within compound path & set stroke
          for (var n = 0; n < currentCompound.pathItems.length; n++) {
            var currentPathInCompound = currentCompound.pathItems[n];

            currentPathInCompound.strokeColor = currentPathInCompound.fillColor;
            currentPathInCompound.strokeOverprint = true;
            currentPathInCompound.strokeMiterLimit = 50;
            currentPathInCompound.strokeWidth = isLastGroup ? 0.25 : 0.35;
          }
        }
      }
    }
  }
}

// Run
try {
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "RTF_Template") {
    RTF_StrokeColors();
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

// Create Checkbox
function createCheckbox(parent, title) {
  var checkbox = parent.add("checkbox", undefined, title);
  return checkbox;
}

// Create Window Button
function createButton(parent, title, onClick) {
  var button = parent.add("button", undefined, title);
  if (onClick !== undefined) button.onClick = onClick;
  return button;
}
