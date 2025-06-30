function SP_PageProof_Note() {
  // Active Document
  var doc = app.activeDocument;

  // Artboard
  app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;
  var artboardIndex = doc.artboards.getActiveArtboardIndex();
  var artboardBounds = doc.artboards[artboardIndex].artboardRect;

  // Swatches
  var redNote = redNoteSwatch();

  // Layers
  var activeLayer = doc.activeLayer;
  var proofLayer = doc.layers.getByName("PROOF");

  // Art Number text frame
  var artNumber = doc.textFrames.getByName("ART_NUMBER");

  // Note data
  var noteData = [
    "** PRINT/FLASH/PRINT **",
    "** PRINT/FLASH/PRINT UB **",
    "** PRINT/FLASH/PRINT WHITE **",
    "CW_1",
    "** LEFT SLEEVE **",
    "** RIGHT SLEEVE **",
  ];

  // GUI Window
  var dialog = new Window("dialog", undefined, undefined, {
    closeButton: false,
  });
  dialog.text = "CREATE NOTE";
  dialog.orientation = "column";
  dialog.alignChildren = ["left", "top"];
  dialog.spacing = 10;
  dialog.margins = 25;

  // Radio Buttons
  for (var i = 0; i < noteData.length; i++) {
    dialog.add("radiobutton", undefined, noteData[i]);
  }

  // Button Control Group
  var buttonGroup = dialog.add("group", undefined, { name: "buttonGroup" });
  buttonGroup.orientation = "row";
  buttonGroup.alignChildren = ["fill", "fill"];
  buttonGroup.spacing = 10;
  buttonGroup.margins = [2, 18, 2, 2];
  buttonGroup.alignment = ["fill", "fill"];

  // Cancel Button
  var cancelButton = buttonGroup.add("button", undefined, "CANCEL");
  cancelButton.onClick = function () {
    dialog.close();
  };

  // OK Button
  var okButton = buttonGroup.add("button", undefined, "OK");
  okButton.onClick = function () {
    // Selected Note storage
    var noteValue;

    // Get selected radiobutton
    for (var i = 0; i < dialog.children.length; i++) {
      var theChild = dialog.children[i];
      if (theChild.type === "radiobutton" && theChild.value) {
        noteValue = theChild.text;
      }
    }

    // Font data
    var font = artNumber.textRange.characterAttributes.textFont;
    var fontSize = 21;

    // Note
    var newNote = activeLayer.textFrames.add();
    newNote.textRange.characterAttributes.textFont = font;
    newNote.textRange.contents = noteValue;
    newNote.textRange.characterAttributes.size = fontSize;
    newNote.textRange.characterAttributes.fillColor = redNote;
    newNote.paragraphs[0].justification = Justification.CENTER;

    // Place Note centered above shirt (if exists), else @ 1" down
    var isShirt = false;
    var shirtCount = 0;

    for (var i = 0; i < proofLayer.pageItems.length; i++) {
      if (proofLayer.pageItems[i].name === "SHIRT") {
        isShirt = true;
        shirtCount++;
      }
    }

    if (isShirt && shirtCount === 1) {
      var theShirt = proofLayer.pageItems.getByName("SHIRT");
      var notePosY = theShirt.position[1] + newNote.height + 5;

      newNote.position = [
        (artboardBounds[2] - artboardBounds[0]) / 2 - newNote.width / 2,
        notePosY,
      ];
    } else {
      newNote.position = [
        (artboardBounds[2] - artboardBounds[0]) / 2 - newNote.width / 2,
        -72,
      ];
    }

    // Close Window
    dialog.close();
  };

  // Show Window
  dialog.show();
}

// Run
try {
  if (
    app.documents.length > 0 &&
    app.activeDocument.artboards[0].name === "PAGE_PROOF"
  ) {
    SP_PageProof_Note();
  } else {
    throw new Error("PAGE_PROOF Template Not Active");
  }
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
}

//*******************
// Helper functions
//*******************

/**
 * Checks if a swatch is named "RED_NOTE". If not, creates the swatch and returns it's color.
 * @returns Color of swatch named "RED_NOTE"
 */
function redNoteSwatch() {
  var hasSwatch = false;

  for (var i = 0; i < app.activeDocument.swatches.length; i++) {
    if (app.activeDocument.swatches[i].name.indexOf("RED_NOTE") !== -1) {
      hasSwatch = true;
      break;
    }
  }

  if (!hasSwatch) {
    var newCMYK = new CMYKColor();
    newCMYK.cyan = 0;
    newCMYK.magenta = 100;
    newCMYK.yellow = 100;
    newCMYK.black = 0;

    var thisSpot = app.activeDocument.spots.add();
    thisSpot.name = "RED_NOTE";
    thisSpot.color = newCMYK;
    thisSpot.colorType = ColorModel.SPOT;
  }

  return app.activeDocument.swatches.getByName("RED_NOTE").color;
}
