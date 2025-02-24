//@include '../UTILITIES/GetItems.jsx';
//@include '../UTILITIES/Layers.jsx';
//@include '../UTILITIES/Settings.jsx';

function SP_CW_ColorSwap() {
  // Active Document
  var doc = app.activeDocument;
  var docLayers = doc.layers;
  var docSwatches = doc.swatches;

  // Exit if no CW_ layers
  if (!cwLayersExist()) throw new Error("No CW Layers");

  // De-select everything
  doc.selection = null;

  // Color Library data from settings file
  var settingsFile = setupSettingsFile("CMT_Seps_Settings", "Settings_ColorLibrary.json");
  var colorLibrary = loadJSONData(settingsFile);

  // Populate names of all swatches in Color Library
  var colorNames = new Array();

  for (var i = 0; i < colorLibrary.length; i++) {
    colorNames.push(colorLibrary[i].name);
  }

  // Sort Color List alphabetically
  colorNames.sort();

  // CW_ Layers {name, colors} data
  var cwValues = new Array();

  for (var i = docLayers.length; i--; ) {
    if (docLayers[i].name.indexOf("CW_") !== -1) {
      cwValues.push({ name: docLayers[i].name, colors: getLayerColorNames(docLayers[i].name) });
    }
  }

  // *** UI Element References ***
  var refTabsCW = new Array();
  var refOriginalPanel = new Array();
  var refOriginalListBox = new Array();
  var refCurrListPanel = new Array();
  var refCurrListBox = new Array();
  var refNewPanel = new Array();
  var refNewListBox = new Array();
  var refSearch = new Array();
  var refReplaceButton = new Array();

  // WINDOW
  // ======
  var swapWindow = new Window("dialog");
  swapWindow.text = "CW COLOR SWAP";
  swapWindow.orientation = "column";
  swapWindow.alignChildren = ["center", "top"];
  swapWindow.spacing = 10;
  swapWindow.margins = 10;

  // TAB PANEL
  // =======
  var tabPanel = swapWindow.add("tabbedpanel", undefined, undefined);
  tabPanel.alignChildren = "fill";
  tabPanel.preferredSize.width = 275;
  tabPanel.margins = 0;

  // CW_TABS
  // ======
  for (var i = 0; i < cwValues.length; i++) {
    var CW_tab = tabPanel.add("tab", undefined, cwValues[i].name);
    CW_tab.name = cwValues[i].name;
    CW_tab.orientation = "row";
    CW_tab.alignChildren = ["left", "top"];
    CW_tab.spacing = 10;
    CW_tab.margins = 10;

    refTabsCW.push(CW_tab);
  }

  // PANEL ORIGINAL COLOR
  // ============

  // Panel
  for (var i = 0; i < cwValues.length; i++) {
    var panelOriginal = refTabsCW[i].add("panel", undefined, "ORIGINAL COLORS");
    panelOriginal.orientation = "column";
    panelOriginal.alignChildren = ["left", "center"];
    panelOriginal.spacing = 10;
    panelOriginal.margins = 10;

    refOriginalPanel.push(panelOriginal);
  }

  // List
  for (var i = 0; i < cwValues.length; i++) {
    var originalColorListBox = refOriginalPanel[i].add("listbox", undefined, cwValues[i].colors, {
      multiselect: true,
      selected: true,
    });
    originalColorListBox.preferredSize.width = 175;

    refOriginalListBox.push(originalColorListBox);
  }

  // Keep all selected/highlighted
  for (var i = 0; i < refOriginalListBox.length; i++) {
    for (var j = 0; j < refOriginalListBox[i].items.length; j++) {
      refOriginalListBox[i].items[j].selected = true;
    }

    refOriginalListBox[i].onChange = function () {
      for (var j = 0; j < this.items.length; j++) {
        this.items[j].selected = true;
      }
    };
  }

  // ========
  // DIVIDER
  // ========
  for (var i = 0; i < cwValues.length; i++) {
    var divider1 = refTabsCW[i].add("panel", undefined, undefined);
    divider1.alignment = "fill";
  }

  // PANEL CURRENT COLOR
  // ============
  for (var i = 0; i < cwValues.length; i++) {
    var panelCurrent = refTabsCW[i].add("panel", undefined, "CURRENT COLORS");
    panelCurrent.orientation = "column";
    panelCurrent.alignChildren = ["left", "center"];
    panelCurrent.spacing = 10;
    panelCurrent.margins = 10;

    refCurrListPanel.push(panelCurrent);
  }

  // LIST BOX CURRENT COLOR
  // ============
  for (var i = 0; i < cwValues.length; i++) {
    var currentColorListBox = refCurrListPanel[i].add("listbox", undefined, cwValues[i].colors);
    currentColorListBox.preferredSize.width = 200;

    refCurrListBox.push(currentColorListBox);
  }

  // ========
  // DIVIDER
  // ========
  for (var i = 0; i < cwValues.length; i++) {
    var divider2 = refTabsCW[i].add("panel", undefined, undefined);
    divider2.alignment = "fill";
  }

  // PANEL NEW COLOR
  // ========
  for (var i = 0; i < cwValues.length; i++) {
    var panelNewColor = refTabsCW[i].add("panel", undefined, "NEW COLOR");
    panelNewColor.orientation = "column";
    panelNewColor.alignChildren = ["center", "center"];
    panelNewColor.spacing = 10;
    panelNewColor.margins = 10;

    refNewPanel.push(panelNewColor);
  }

  // LIST BOX NEW COLOR
  // ========
  for (var i = 0; i < cwValues.length; i++) {
    var newColorListBox = refNewPanel[i].add("listbox", undefined, colorNames);
    newColorListBox.preferredSize.width = 200;
    newColorListBox.preferredSize.height = 200;

    refNewListBox.push(newColorListBox);
  }

  // SEARCH NEW COLOR
  // ========
  for (var i = 0; i < cwValues.length; i++) {
    var searchTitle = refNewPanel[i].add("statictext", undefined, "Search:");
    var search = refNewPanel[i].add("edittext", undefined);
    search.preferredSize.width = 200;
    search.name = i;

    refSearch.push(search);
  }

  for (var i = 0; i < refSearch.length; i++) {
    refSearch[i].onChanging = function () {
      var temp = this.text;
      var searchIndex = this.name;
      var tempList = new Array();

      // Search for name matches & push to tempList
      for (var j = 0; j < colorNames.length; j++) {
        if (colorNames[j].toLowerCase().indexOf(temp.toLowerCase()) > -1) {
          tempList.push(colorNames[j]);
        }
      }

      // Replace list box with matching results in tempList
      if (tempList.length > 0) {
        var tempBox = refNewPanel[searchIndex].add("listbox", refNewListBox[searchIndex].bounds, tempList);
        refNewListBox[searchIndex] = tempBox;
      }
    };
  }

  // REPLACE BUTTON NEW COLOR
  // ========
  for (var i = 0; i < cwValues.length; i++) {
    var replaceColorButton = refNewPanel[i].add("button", undefined, "REPLACE COLOR");
    replaceColorButton.alignment = ["fill", "center"];
    replaceColorButton.name = i;

    refReplaceButton.push(replaceColorButton);
  }

  for (var i = 0; i < refReplaceButton.length; i++) {
    refReplaceButton[i].onClick = function () {
      var replIndex = this.name;

      if (!refCurrListBox[replIndex].selection) {
        alert("No Current Color Selection", "ERROR", true);
        return;
      }
      if (!refNewListBox[replIndex].selection) {
        alert("No Replacement Color Selection", "ERROR", true);
        return;
      }

      var tempColors = [];
      var selIndex = refCurrListBox[replIndex].selection.index;

      // Copy colors in current colors list to tempColors
      for (var k = 0; k < refCurrListBox[replIndex].items.length; k++) {
        tempColors.push(refCurrListBox[replIndex].items[k]);
      }

      // Replace selected current color w/ selected replacement color in tempList
      var currentColorSelected = refCurrListBox[replIndex].selection;
      tempColors[currentColorSelected.index] = refNewListBox[replIndex].selection.text;

      // Replace current color list box w/ new box from tempList
      var tempCurrentColorList = refCurrListPanel[replIndex].add("listbox", refCurrListBox[replIndex].bounds, tempColors);
      refCurrListBox[replIndex] = tempCurrentColorList;
      refCurrListBox[replIndex].selection = selIndex;
    };
  }

  // BUTTONGROUP
  // ===========
  var buttonGroup = swapWindow.add("group", undefined, { name: "buttonGroup" });
  buttonGroup.orientation = "row";
  buttonGroup.alignChildren = ["left", "center"];
  buttonGroup.spacing = 10;
  buttonGroup.margins = 0;

  var cancelButton = buttonGroup.add("button", undefined, "CANCEL", { name: "cancel" });

  // Data for swaps {layer, swaps}
  var swapData = new Array();

  var okButton = buttonGroup.add("button", undefined, "OK", { name: "ok" });
  okButton.onClick = function () {
    // New Values
    var cwNewValues = new Array();

    // Add new values object to
    for (var i = 0; i < cwValues.length; i++) {
      var newObj = { name: cwValues[i].name, colors: [] };

      for (var j = 0; j < refCurrListBox[i].items.length; j++) {
        newObj.colors.push(refCurrListBox[i].items[j].text);
      }

      cwNewValues.push(newObj);
    }

    // Compare old & new values, add to data object array
    for (var i = 0; i < cwValues.length; i++) {
      var swapColors = new Array();

      for (var j = 0; j < cwValues[i].colors.length; j++) {
        if (cwValues[i].colors[j] !== cwNewValues[i].colors[j]) {
          swapColors.push([cwValues[i].colors[j], cwNewValues[i].colors[j]]);
        }
      }

      swapData.push({ layer: cwValues[i].name, swaps: swapColors });
    }

    // Analyze swaps and execute changes
    for (var i = 0; i < swapData.length; i++) {
      // Exit if no swaps for this layer
      if (!swapData[i].swaps.length) continue;

      // Create new spot swatch & recolor paths
      for (var j = 0; j < swapData[i].swaps.length; j++) {
        var theColorData = getColorData(colorLibrary, swapData[i].swaps[j][1]);
        var newSpot = generateNewSpot(theColorData);
        var theSwatch = docSwatches.getByName(newSpot.name);

        recolorPathsInLayer(swapData[i].layer, swapData[i].swaps[j][0], theSwatch);
      }
    }

    // Close Window
    swapWindow.close();
  };

  // Show Swap Window
  swapWindow.show();
}

// Run
try {
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "SP_Template") {
    SP_CW_ColorSwap();
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
 * Returns a color data object from a list.
 * @param {Object[]}   colorList Array of color data objects
 * @param {String}     colorName Name of the color
 * @returns {Object}
 */
function getColorData(colorList, colorName) {
  for (var i = 0; i < colorList.length; i++) {
    if (colorList[i].name === colorName) return colorList[i];
  }
}

/**
 * Returns a new Spot Color added to the document from a color data object.
 * @param {Object}    data Color data object
 * @returns {Spot}
 */
function generateNewSpot(data) {
  var theSpot = app.activeDocument.spots.add();
  theSpot.name = data.name;
  theSpot.colorType = ColorModel.SPOT;

  switch (data.kind) {
    case "LAB":
      var newLAB = new LabColor();
      newLAB.l = data.values[0];
      newLAB.a = data.values[1];
      newLAB.b = data.values[2];
      theSpot.color = newLAB;
      break;
    case "RGB":
      var newRGB = new RGBColor();
      newRGB.red = data.values[0];
      newRGB.green = data.values[1];
      newRGB.blue = data.values[2];
      theSpot.color = newRGB;
    case "CMYK":
      var newCMYK = new CMYKColor();
      newCMYK.cyan = data.values[0];
      newCMYK.magenta = data.values[1];
      newCMYK.yellow = data.values[2];
      newCMYK.black = data.values[3];
      theSpot.color = newCMYK;
    default:
      break;
  }

  return theSpot;
}
