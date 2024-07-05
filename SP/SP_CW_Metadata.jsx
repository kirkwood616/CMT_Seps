function SP_CW_Metadata() {
  // Active Document
  var doc = app.activeDocument;

  // Deselect everything, trick redraw
  doc.selection = null;
  doc.activeLayer.visible = false;
  doc.activeLayer.visible = true;

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
  var bottomCrosshair = registrationLayer.groupItems.getByName("REG_BOTTOM_CENTER");
  var regPosition = bottomCrosshair.position;

  // Deselect everything
  doc.selection = null;

  // Ungroup CW layers
  for (var i = 0; i < cwLayers.length; i++) {
    var layerCW = docLayers.getByName(cwLayers[i]);
    layerCW.hasSelectedArtwork = true;
    if (doc.selection.length > 0) {
      for (var j = 0; j < doc.selection.length; j++) {
        ungroup(doc.selection[j]);
      }
    }
    doc.selection = null;
  }

  // Storage for color names in each CW layer
  var cwValues = new Array();

  for (var i = 0; i < cwLayers.length; i++) {
    var cwLayer = docLayers.getByName(cwLayers[i]);
    var pathsArr = new Array();
    addPathsToStorage(cwLayer, pathsArr);
    var colorNameStorage = new Array();

    for (var j = 0; j < pathsArr.length; j++) {
      if (pathsArr[j].fillColor.typename !== "SpotColor") {
        cwRegroupArt(cwLayers);
        throw new Error("Non-Spot Colors Found" + "\n" + "Check & Set Non-Spot Colors to Spot Color(s).");
      } else {
        colorNameStorage.push(pathsArr[j].fillColor.spot.name);
      }
    }

    var cwSpotNames = removeDuplicate(colorNameStorage);
    cwValues.push({ name: cwLayer.name, colors: cwSpotNames });

    doc.selection = null;
  }

  // GUI Window
  var windowCW = new Window("dialog", "Confirm Colorways", undefined, { closeButton: false });
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
    }
    // Color checkboxes (disabled)
    for (var k = 0; k < cwValues[i].colors.length; k++) {
      var cwColorCheck = cwTabPanel.add("checkbox", undefined, cwValues[i].colors[k]);
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
    windowCW.close();
  };
  var okButton = buttonGroup.add("button", undefined, "Generate", { name: "ok" });

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
      var frameContents = metadataLayer.textFrames[i].textRange.contents.toUpperCase();
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
            var cwFrameColor = docSwatches.getByName(cwFinalValues[i].colors[j]).color;
            var cwNewFrame = cwTextFrame(doc, cwFinalValues[i].name, cwFrameColor, [xValueOrigin, yPos], i);
          }
          break;
        case cwCount >= 3:
          if (i + 1 === 5) xOffset = 0;

          for (var j = 0; j < cwFinalValues[i].colors.length; j++) {
            var cwFrameColor = docSwatches.getByName(cwFinalValues[i].colors[j]).color;
            var cwNewFrame;

            if (i + 1 < 5) {
              cwNewFrame = cwTextFrame(doc, cwFinalValues[i].name, cwFrameColor, [xValueLeftOrigin + xOffset, yPos], i);
            } else {
              cwNewFrame = cwTextFrame(doc, cwFinalValues[i].name, cwFrameColor, [xValueRightOrigin + xOffset, yPos], i);
            }
          }

          if (isEven(i + 1)) xOffset += 26.5673;

          break;
        default:
          break;
      }
    }

    // Deselect everything
    doc.selection = null;

    // Group art on CW layers
    cwRegroupArt(cwLayers);

    // Close Window
    windowCW.close();
  };

  // Show Window
  windowCW.show();
}

// Run
try {
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "SP_Template") {
    SP_CW_Metadata();
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
 * Regroups art on layers prefixed with CW_ within the document.
 * @param {string[]} cwLayerNames Array of the layer names contained in document prefixed with "CW_"
 * @returns {void}
 */
function cwRegroupArt(cwLayerNames) {
  for (var i = 0; i < cwLayerNames.length; i++) {
    var cwLayer = app.activeDocument.layers.getByName(cwLayerNames[i]);

    // App "catch up" hack
    cwLayer.visible = false;
    cwLayer.visible = true;

    cwLayer.hasSelectedArtwork = true;
    var docSel = new Array();
    docSel = app.activeDocument.selection;
    var newGroup = cwLayer.groupItems.add();

    if (docSel.length > 0) {
      for (j = 0; j < docSel.length; j++) {
        docSel[j].moveToEnd(newGroup);
      }
    }

    // Deselect everything
    app.activeDocument.selection = null;
  }
}

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

/**
 * Ungroup a groupItem within Adobe Illustrator. Similar to `Object > Ungroup`
 * @param {*} object    An Adobe Illustrator groupItem
 * @param {*} recursive Should nested groupItems also be ungrouped
 */
function ungroup(object, recursive) {
  if (object.typename != "GroupItem") {
    return;
  }
  recursive = typeof recursive !== "undefined" ? recursive : true;
  var subObject;
  while (object.pageItems.length > 0) {
    if (object.pageItems[0].typename == "GroupItem" && !object.pageItems[0].clipped) {
      subObject = object.pageItems[0];
      subObject.move(object, ElementPlacement.PLACEBEFORE);
      if (recursive) {
        ungroup(subObject, recursive);
      }
    } else {
      object.pageItems[0].move(object, ElementPlacement.PLACEBEFORE);
    }
  }
}

/**
 * Removes duplicate items from an array.
 * @param {Array}   arr Array
 * @returns {Array}
 */
function removeDuplicate(arr) {
  var result = [];
  var idx = 0;
  var tmp = {};

  for (var i = 0; i < arr.length; i++) {
    if (!tmp[arr[i]]) {
      tmp[arr[i]] = 1;
      result[idx] = arr[i];
      idx++;
    }
  }
  return result;
}

function getAllChildren(obj) {
  var childArray = new Array();
  for (var i = 0; i < obj.pageItems.length; i++) {
    childArray.push(obj.pageItems[i]);
  }
  return childArray;
}

function addPathsToStorage(obj, storageArray) {
  var elements = getAllChildren(obj);
  if (elements.length < 1) {
    return;
  } else {
    for (var i = 0; i < elements.length; i++) {
      try {
        switch (elements[i].typename) {
          case "PathItem":
            storageArray.push(elements[i]);
            break;
          case "GroupItem":
            addPathsToStorage(elements[i]);
            break;
          case "CompoundPathItem":
            var _pathItems = elements[i].pathItems;
            for (var j = 0; j < _pathItems.length; j++) {
              storageArray.push(_pathItems[j]);
            }
            break;
          default:
            throw new Error("Non-Path Elements Found");
        }
      } catch (e) {}
    }
  }
}
