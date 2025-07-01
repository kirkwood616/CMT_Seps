//@include '../UTILITIES/Layers.jsx';

function SP_Set_Location() {
  // Illustrator Coordinate System
  app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;

  // Active Document
  var doc = app.activeDocument;

  // Layers in document
  var docLayers = doc.layers;

  // If Art layer try to select, else alert & exit if no selection
  selectArtLayer();

  // Artboard Index
  var artboardIndex = doc.artboards.getActiveArtboardIndex();

  // Artboard rectangle bounding coordinates array
  var artboardBounds = doc.artboards[artboardIndex].artboardRect;

  // Metadata
  var metaLayer = docLayers.getByName("Metadata");
  var metaGroup = metaLayer.groupItems.getByName("MetaGroup");
  var metaLocation = metaGroup.textFrames.getByName("_LOCATION");

  // Registration
  var regLayer = docLayers.getByName("Registration");
  var regTopCenter = regLayer.groupItems.getByName("REG_TOP_CENTER");
  var regBottomCenter = regLayer.groupItems.getByName("REG_BOTTOM_CENTER");

  // Locations
  var locations = ["SC", "SL", "SR", "PK", "UD", "YOKE"];

  // Window
  var locationWindow = createWindow("SELECT LOCATION", 300);

  // Location group
  var locationGroup = createGroup(locationWindow, "row");

  // Instruction text
  var selectText = createStaticText(locationGroup, "Select Location:");

  // Location dropdown selection
  var locationDropdown = createDropdown(locationGroup, locations);

  // Buttons
  var buttonGroup = createGroup(locationWindow, "row");
  var cancelButton = createButton(buttonGroup, "CANCEL", function () {
    locationWindow.close();
  });

  var okButton = createButton(buttonGroup, "OK", function () {
    var artSelection = doc.selection[0];
    var selectedLocation = locationGroup.children[1].selection.text;
    var metaLocationText = metaLocation.textRange.contents;
    var centerPosition =
      (artboardBounds[2] - artboardBounds[0]) / 2 - doc.selection[0].width / 2;
    var regCenteredPosition = 553.22509765623;
    var regTopCenterBasePosition = [regCenteredPosition, -49.7246093738895];

    // Original position of selection
    var originalPosition = new Array(
      artSelection.position[0],
      artSelection.position[1]
    );

    // Top-center registration visible
    regTopCenter.hidden = false;

    switch (selectedLocation) {
      case "SC":
        // Rotate selection if matches a rotated location
        locationRotate(metaLocationText, artSelection);
        // Position selection centered & 2 inches from top of artboard
        artSelection.position = new Array(centerPosition, -144);
        // Move UB art to the new location and rotate if necessary
        moveLocationUB(
          metaLocationText,
          selectedLocation,
          artSelection,
          originalPosition
        );
        // Position top-center registration to base position
        regTopCenter.position = [
          regCenteredPosition,
          regTopCenterBasePosition[1],
        ];
        // Position bottom-center registration 0.50" from art
        regBottomCenter.position = [
          regCenteredPosition,
          yPositionRegBottom(artSelection),
        ];

        // Position metaGroup
        metaGroup.position = [487.296692817155, -49.7230914550501];
        // Update location text frame to new position
        metaLocation.textRange.contents = selectedLocation;

        break;
      case "YOKE":
        // Rotate selection if matches a rotated location
        locationRotate(metaLocationText, artSelection);
        // Position selection centered & 1" down from top of artboard
        artSelection.position = [centerPosition, -72];
        // Move UB art to the new location and rotate if necessary
        moveLocationUB(
          metaLocationText,
          selectedLocation,
          artSelection,
          originalPosition
        );
        // Position top-center registration at 0.125" from top of artboard
        regTopCenter.position = [regCenteredPosition, -9];
        // Position bottom-center registration 0.50" down from art
        regBottomCenter.position = [
          regCenteredPosition,
          yPositionRegBottom(artSelection),
        ];
        // Position metaGroup to regTopCenter
        metaGroup.position = [487.296692817155, -8.99994692380005];
        // Update location text frame to new position
        metaLocation.textRange.contents = selectedLocation;
        break;
      case "SL":
        // Rotate selection if matches a rotated location
        locationRotate(metaLocationText, artSelection);
        // Position selection centered to SL position & 2 inches from top of artboard
        artSelection.position = new Array(xPositionSL(artSelection), -144);
        // Move UB art to the new location and rotate if necessary
        moveLocationUB(
          metaLocationText,
          selectedLocation,
          artSelection,
          originalPosition
        );
        // Position top-center registration to base position
        regTopCenter.position = [
          regCenteredPosition,
          regTopCenterBasePosition[1],
        ];
        // Position bottom-center registration 0.50" from art
        regBottomCenter.position = [
          regCenteredPosition,
          yPositionRegBottom(artSelection),
        ];
        // Position metaGroup
        metaGroup.position = [487.296692817155, -49.7230914550501];
        // Update location text frame to new position
        metaLocation.textRange.contents = selectedLocation;
        break;
      case "SR":
        // Rotate selection if matches a rotated location
        locationRotate(metaLocationText, artSelection);
        // Position selection centered to SR position & 2 inches from top of artboard
        artSelection.position = new Array(xPositionSR(artSelection), -144);
        // Move UB art to the new location and rotate if necessary
        moveLocationUB(
          metaLocationText,
          selectedLocation,
          artSelection,
          originalPosition
        );
        // Position top-center registration to base position
        regTopCenter.position = [
          regCenteredPosition,
          regTopCenterBasePosition[1],
        ];
        // Position bottom-center registration 0.50" from art
        regBottomCenter.position = [
          regCenteredPosition,
          yPositionRegBottom(artSelection),
        ];
        // Position metaGroup
        metaGroup.position = [487.296692817155, -49.7230914550501];
        // Update location text frame to new position
        metaLocation.textRange.contents = selectedLocation;
        break;
      case "PK":
        // Hide top-center registration
        regTopCenter.hidden = true;
        // Rotate selection
        if (metaLocationText !== "UD") {
          artSelection.rotate(180);
        }
        // Position selection centered & at top of artboard
        artSelection.position = [centerPosition, 0];
        // Move UB art to the new location and rotate if necessary
        moveLocationUB(
          metaLocationText,
          selectedLocation,
          artSelection,
          originalPosition
        );
        // Position bottom-center registration 0.50" down from art
        regBottomCenter.position = [
          regCenteredPosition,
          yPositionRegBottom(artSelection),
        ];
        // Position metaGroup
        metaGroup.position = [
          487.296692817155,
          yPositionRegBottom(artSelection) - 4,
        ];
        // Update location text frame to new position
        metaLocation.textRange.contents = selectedLocation;
        break;
      case "UD":
        // Rotate selection
        if (metaLocationText !== "PK") {
          artSelection.rotate(180);
        }
        // Position selection centered & 1" down from top of artboard
        artSelection.position = [centerPosition, -72];
        // Move UB art to the new location and rotate if necessary
        moveLocationUB(
          metaLocationText,
          selectedLocation,
          artSelection,
          originalPosition
        );
        // Position top-center registration at 0.125" from top of artboard
        regTopCenter.position = [regCenteredPosition, -9];
        // Position bottom-center registration 0.50" down from art
        regBottomCenter.position = [
          regCenteredPosition,
          yPositionRegBottom(artSelection),
        ];
        // Position metaGroup to regTopCenter
        metaGroup.position = [487.296692817155, -8.99994692380005];
        // Update location text frame to new position
        metaLocation.textRange.contents = selectedLocation;
        break;
      default:
        break;
    }

    // De-select everything
    doc.selection = null;

    // Close Window
    locationWindow.close();
  });

  // Show Window
  locationWindow.show();
}

// Run
try {
  if (
    app.documents.length > 0 &&
    app.activeDocument.artboards[0].name === "SP_Template"
  ) {
    SP_Set_Location();
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
 * @param {Number} width Width of window
 * @returns {Window}
 */
function createWindow(title, width) {
  var window = new Window("dialog", title);
  window.orientation = "column";
  window.preferredSize.width = width;
  return window;
}

/**
 * Creates a group item.
 * @param {Window|Group|Panel} parent Where to add group into
 * @param {String} orientation Orientation of the group
 * @param {String} [align] Alignment of group's children
 * @returns {Group}
 */
function createGroup(parent, orientation, align) {
  var group = parent.add("group");
  group.orientation = orientation;
  group.alignChildren = align;
  return group;
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
 * Creates a dropdown item.
 * @param {Window|Group|Panel} parent Where to add dropdown into
 * @param {Array.<string>} list List of selectable items
 * @returns {DropDownList}
 */
function createDropdown(parent, list) {
  var dropdown = parent.add("dropdownlist", undefined, list);
  dropdown.selection = 0;
  return dropdown;
}

/**
 * Creates a clickable button.
 * @param {Window|Group|Panel} parent Where to add button into
 * @param {String} title Text to be shown inside of button
 * @param {() => void} onClick Callback function to run when button is clicked
 * @returns {Button}
 */
function createButton(parent, title, onClick) {
  var button = parent.add("button", undefined, title);
  if (onClick !== undefined) button.onClick = onClick;
  return button;
}

/**
 * Checks if current location text matches a rotated location.
 *
 * If true, rotates selection 180 degrees.
 * @param {String} contents Location text
 * @param {any} selection Current selection
 */
function locationRotate(contents, selection) {
  if (contents === "PK" || contents === "UD") {
    selection.rotate(180);
  }
}

/**
 * Returns the X position for selected art to be centered at 11.75" on the artboard in the SL location.
 * @param {any} selection Current selection
 * @returns {number}
 */
function xPositionSL(selection) {
  var xPosition = selection.position[0];
  var xPositionLocationCenter = 846;
  var toPositionCenter = xPositionLocationCenter / xPosition;
  var selectionCenter = selection.width / 2;

  return xPosition * toPositionCenter - selectionCenter;
}

/**
 * Returns the X position for selected art to be centered at 11.75" on the artboard in the SR location.
 * @param {any} selection Current selection
 * @returns {number}
 */
function xPositionSR(selection) {
  var xPosition = selection.position[0];
  var xPositionLocationCenter = 306;
  var toPositionCenter = xPosition / xPositionLocationCenter;
  var selectionCenter = selection.width / 2;

  return xPosition / toPositionCenter - selectionCenter;
}

/**
 * Returns the Y position for the bottom registration mark.
 *
 * Accounts for a 0.50" margin from the bottom of the art to the top of registration mark.
 * @param {any} selection Current selection
 * @returns {number}
 */
function yPositionRegBottom(selection) {
  var artHeight = selection.height;
  var yPositionArtBottom = selection.position[1] * -1 + artHeight;

  return yPositionArtBottom * -1 - 36;
}

/**
 * Moves the UB, if present, to the new location of the Art selection and rotated
 * based on the current and selected location.
 * @param {String}    currLoc The current set location
 * @param {String}    newLoc The new location
 * @param {any}       artSel Selected artwork
 * @param {Array}     ogPos Original position of the art
 * @returns {void}
 */
function moveLocationUB(currLoc, newLoc, artSel, ogPos) {
  if (!isLayerNamed("UB")) return;

  var ubLayer = app.activeDocument.layers.getByName("UB");

  if (ubLayer.pageItems.length < 1) return;

  var moveDifference = new Array(
    artSel.position[0] - ogPos[0],
    artSel.position[1] - ogPos[1]
  );

  app.activeDocument.selection = null;
  ubLayer.hasSelectedArtwork = true;

  if (app.activeDocument.selection.length > 1) {
    app.executeMenuCommand("group");
  }

  var rect = ubLayer.pathItems.rectangle(
    ogPos[0],
    ogPos[1],
    artSel.width,
    artSel.height
  );

  rect.position = [ogPos[0], ogPos[1]];

  ubLayer.hasSelectedArtwork = true;
  app.executeMenuCommand("group");
  app.activeDocument.selection[0].translate(
    moveDifference[0],
    moveDifference[1]
  );

  if (newLoc === "UD" || newLoc === "PK") {
    if (currLoc !== "UD" || "PK") {
      app.activeDocument.selection[0].rotate(180);
    }
  }

  if (newLoc !== "UD" || "PK") {
    if (currLoc === "UD" || currLoc === "PK") {
      app.activeDocument.selection[0].rotate(180);
    }
  }

  app.executeMenuCommand("ungroup");
  rect.remove();
}
