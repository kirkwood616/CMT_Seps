//@include '../UTILITIES/Positioning.jsx';

function AF_Fit_Artboard() {
  // Illustrator Coordinate System
  app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;

  // Active Document
  var doc = app.activeDocument;

  // Artboard
  var artboardIndex = doc.artboards.getActiveArtboardIndex();
  var artBoard = doc.artboards[artboardIndex];

  // Visible Bounds of art
  var theVisibleBounds = doc.visibleBounds;

  // GUI
  // ===
  var gui = new Window("dialog");
  gui.text = "Fit Artboard";
  gui.preferredSize.width = 300;
  gui.orientation = "column";
  gui.alignChildren = ["fill", "center"];
  gui.spacing = 10;
  gui.margins = 25;

  var fitToBounds = gui.add("radiobutton", undefined, undefined, {
    name: "fitToBounds",
  });
  fitToBounds.helpTip = "No Padding";
  fitToBounds.text = "Fit To Art Bounds (no padding)";
  fitToBounds.value = true;
  fitToBounds.onClick = function () {
    paddingPanel.enabled = false;
  };

  var fitPadding = gui.add("radiobutton", undefined, undefined, {
    name: "fitPadding",
  });
  fitPadding.text = "Fit With Padding";
  fitPadding.onClick = function () {
    paddingPanel.enabled = true;
  };

  // PADDINGPANEL
  // ============
  var paddingPanel = gui.add("panel", undefined, undefined, {
    name: "paddingPanel",
  });
  paddingPanel.text = "Padding";
  paddingPanel.orientation = "row";
  paddingPanel.alignChildren = ["left", "fill"];
  paddingPanel.spacing = 10;
  paddingPanel.margins = 10;
  paddingPanel.enabled = false;

  var paddingInput = paddingPanel.add(
    'edittext {justify: "center", properties: {name: "paddingInput"}}',
  );
  paddingInput.text = "0.25";
  paddingInput.preferredSize.width = 45;

  var staticInches = paddingPanel.add("statictext", undefined, undefined, {
    name: "staticInches",
  });
  staticInches.text = "inches";

  // BUTTONGROUP
  // ===========
  var buttonGroup = gui.add("group", undefined, { name: "buttonGroup" });
  buttonGroup.orientation = "row";
  buttonGroup.alignChildren = ["center", "fill"];
  buttonGroup.spacing = 10;
  buttonGroup.margins = 0;

  var cancelButton = buttonGroup.add("button", undefined, "CANCEL", {
    name: "cancel",
  });

  var okButton = buttonGroup.add("button", undefined, "OK", { name: "ok" });
  okButton.onClick = function () {
    // Fit to Artwork Bounds
    if (fitToBounds.value) {
      artBoard.artboardRect = theVisibleBounds;
      gui.close();
    }

    // Padding input to numerical decimal value
    var paddingFloat = parseFloat(paddingInput.text);

    // Alert if padding input is not a number
    if (fitPadding.value && isNaN(paddingFloat)) {
      alert("Non-Number Entered.\n\nEnter Numerical Value for Padding");
    }

    // Fit w/ Padding
    if (fitPadding.value && !isNaN(paddingFloat)) {
      // Convert padding to points
      var paddingToPoints = paddingFloat * 72;

      //  Add padding to visible bounds & re-size artboard
      theVisibleBounds[0] -= paddingToPoints; // left coordinate (use negative values to add artboard)
      theVisibleBounds[1] += paddingToPoints; // top coordinate
      theVisibleBounds[2] += paddingToPoints; // right coordinate
      theVisibleBounds[3] -= paddingToPoints; // bottom coordinate (use negative values to add artboard)
      artBoard.artboardRect = theVisibleBounds;
      gui.close();
    }
  };

  // Show GUI
  gui.show();
}

// Run
try {
  if (app.documents.length > 0) {
    AF_Fit_Artboard();
  } else {
    throw new Error("Error");
  }
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
}
