//@include '../UTILITIES/Layers.jsx';
//@include '../UTILITIES/Colors.jsx';
//@include '../UTILITIES/Artboards.jsx';

function SP_CW_Metadata_V2() {
  // Active Document
  var doc = app.activeDocument;

  // Exit if no CW_ layers
  if (!cwLayersExist()) throw new Error("No CW Layers");

  // Deselect everything
  doc.selection = null;

  // Layers in document
  var docLayers = doc.layers;

  // Storage array for CW layer names
  var cwLayers = new Array();

  // Add CW layer names to storage array
  for (var i = docLayers.length; i--; ) {
    if (docLayers[i].name.indexOf("CW_") !== -1) {
      cwLayers.push(docLayers[i].name);
    }
  }

  // Exit if no CW layers
  if (!cwLayers.length) {
    throw new Error("No Colorway (CW) Layers");
  }

  // Illustrator Coordinate System
  app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;
  // Artboard Index
  var artboardIndex = doc.artboards.getActiveArtboardIndex();
  // Artboard rectangle bounding coordinates array
  var artboardBounds = doc.artboards[artboardIndex].artboardRect;

  // Swatches
  var docSwatches = doc.swatches;
  var swatchesUB = new Array();
  // Add UB swatches to storage array
  for (var i = 0; i < docSwatches.length; i++) {
    if (docSwatches[i].name.indexOf("WHITE UB") !== -1) {
      swatchesUB.push(docSwatches[i].name);
    }
  }

  // Metadata Layer items
  var metadataLayer = doc.layers.getByName("Metadata");

  // Registration Layer items
  var registrationLayer = doc.layers.getByName("Registration");
  var bottomCrosshair =
    registrationLayer.groupItems.getByName("REG_BOTTOM_CENTER");
  var regPosition = bottomCrosshair.position;

  // Deselect everything
  doc.selection = null;

  // Make all CW layers visible
  for (var i = 0; i < cwLayers.length; i++) {
    var layerCW = docLayers.getByName(cwLayers[i]);
    if (!layerCW.visible) layerCW.visible = true;
  }

  // Store visibility states of layers
  var visibleLayers = storeLayerVisibility();

  // Turn visibility off for all layers
  for (var i = docLayers.length; i--; ) {
    docLayers[i].visible = false;
  }

  // Storage for color names in each CW layer
  var cwValues = new Array();

  // Temporary Artboard (get enabled inks hack)
  var newArtboard = addInchArtboard();

  // Add colors to storage
  for (var i = 0; i < cwLayers.length; i++) {
    var cwLayer = docLayers.getByName(cwLayers[i]);
    cwLayer.visible = true;
    var cwEnabledInks = storeEnabledInkNames();
    cwValues.push({ name: cwLayer.name, colors: cwEnabledInks });
    cwLayer.visible = false;
  }

  // Delete temporary Artboard
  newArtboard.remove();

  // Restore visible layers
  restoreVisibleLayers(visibleLayers);

  // GUI Window
  var windowCW = new Window("dialog", "Confirm Colorways", undefined, {
    closeButton: false,
  });
  windowCW.alignChildren = "right";

  // Tab Panel
  var tabPanel = windowCW.add("tabbedpanel");
  tabPanel.alignChildren = "fill";
  tabPanel.preferredSize = [325, 300];

  // Populate tabs w/ selection choice of UB & colors in CW layer
  for (var i = 0; i < cwValues.length; i++) {
    // Tab
    var cwTab = tabPanel.add("tab", undefined, cwValues[i].name);
    cwTab.name = cwValues[i].name;
    cwTab.alignChildren = "fill";

    // Panel in Tab
    var cwTabPanel = cwTab.add("panel", undefined, "Colors");
    cwTabPanel.alignChildren = "left";
    // UB checkboxes
    for (var j = 0; j < swatchesUB.length; j++) {
      var ubCheck = cwTabPanel.add("checkbox", undefined, swatchesUB[j]);
      ubCheck.value = true;
    }
    // Color checkboxes (disabled)
    for (var k = 0; k < cwValues[i].colors.length; k++) {
      var cwColorCheck = cwTabPanel.add(
        "checkbox",
        undefined,
        cwValues[i].colors[k],
      );
      cwColorCheck.value = true;
      cwColorCheck.onClick = function () {
        this.value = true;
      };
    }
  }

  // Button Control Group
  var buttonGroup = windowCW.add("group");
  var cancelButton = buttonGroup.add("button", undefined, "Cancel");
  cancelButton.onClick = function () {
    cwRegroupArt(cwLayers);
    windowCW.close();
  };
  var okButton = buttonGroup.add("button", undefined, "Generate", {
    name: "ok",
  });

  // Generate on OK
  okButton.onClick = function () {
    var cwFinalValues = new Array();
    var tabs = tabPanel.children;

    // Add selection to cwFinalValues array
    for (var i = 0; i < tabs.length; i++) {
      var currentTab = tabs[i];
      var currentPanel = currentTab.children[0];
      var currentCheckBoxes = currentPanel.children;
      var selectedColors = new Array();

      for (var j = 0; j < currentCheckBoxes.length; j++) {
        if (currentCheckBoxes[j].value) {
          selectedColors.push(currentCheckBoxes[j].text);
        }
      }

      cwFinalValues.push({ name: currentTab.name, colors: selectedColors });
    }

    // Remove any pre-existing CW_ metadata
    doc.selection = null;
    for (var i = 0; i < metadataLayer.textFrames.length; i++) {
      var frameContents =
        metadataLayer.textFrames[i].textRange.contents.toUpperCase();
      if (frameContents.indexOf("CW_") !== -1) {
        metadataLayer.textFrames[i].selected = true;
      }
    }
    app.cut();

    // Generate Text Frames
    var xOffset = 0;

    for (var i = 0; i < cwFinalValues.length; i++) {
      var cwCount = cwFinalValues.length;
      // X & Y values
      var xValueOrigin = regPosition[0] - 6.1646;
      var yValueOdd = regPosition[1] - 6.3865;
      var yValueEven = regPosition[1] - 15.7928;
      var yPos = isEven(i + 1) ? yValueEven : yValueOdd;
      // X values for CW's > 2
      var xValueLeftOrigin = regPosition[0] - 32.7319;
      var xValueRightOrigin = regPosition[0] + 32.6255;

      switch (true) {
        case cwCount < 3:
          for (var j = 0; j < cwFinalValues[i].colors.length; j++) {
            var cwFrameColor = docSwatches.getByName(
              cwFinalValues[i].colors[j],
            ).color;
            var cwNewFrame = cwTextFrame(
              doc,
              cwFinalValues[i].name,
              cwFrameColor,
              [xValueOrigin, yPos],
              i,
            );
          }
          break;
        case cwCount >= 3:
          if (i + 1 === 5) xOffset = 0;

          for (var j = 0; j < cwFinalValues[i].colors.length; j++) {
            var cwFrameColor = docSwatches.getByName(
              cwFinalValues[i].colors[j],
            ).color;
            var cwNewFrame;

            if (i + 1 < 5) {
              cwNewFrame = cwTextFrame(
                doc,
                cwFinalValues[i].name,
                cwFrameColor,
                [xValueLeftOrigin + xOffset, yPos],
                i,
              );
            } else {
              cwNewFrame = cwTextFrame(
                doc,
                cwFinalValues[i].name,
                cwFrameColor,
                [xValueRightOrigin + xOffset, yPos],
                i,
              );
            }
          }

          if (isEven(i + 1)) xOffset += 26.5673;

          break;
        default:
          break;
      }
    }

    // De-select everything
    doc.selection = null;

    // Close Window
    windowCW.close();
  };

  // Show Window
  windowCW.show();
}

// Run
try {
  if (
    app.documents.length > 0 &&
    app.activeDocument.artboards[0].name === "SP_Template"
  ) {
    SP_CW_Metadata_V2();
  } else {
    throw new Error("SP Template File Not Active");
  }
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
}

//*******************
// Helper functions
//*******************

function cwTextFrame(document, cwNumber, frameColor, position, index) {
  var newFrame = document.layers.getByName("Metadata").textFrames.add();
  var helveticaFont = app.textFonts.getByName("Helvetica-Bold");

  // Constants
  newFrame.textRange.characterAttributes.size = 7;
  newFrame.textRange.characterAttributes.textFont = helveticaFont;
  newFrame.textRange.characterAttributes.overprintFill = true;

  // Conditionals
  newFrame.textRange.contents = cwNumber;
  newFrame.textRange.characterAttributes.fillColor = frameColor;
  //// Justify
  if (index < 4) {
    newFrame.paragraphs[0].justification = Justification.RIGHT;
  } else {
    newFrame.paragraphs[0].justification = Justification.LEFT;
  }
  //// pos X,Y
  newFrame.position = [position[0], position[1]];

  return newFrame;
}

/**
 * Takes a number and returns true if it is even, or false if it is odd.
 * @param {number} n A number
 * @returns {boolean}
 */
function isEven(n) {
  return n % 2 == 0;
}
