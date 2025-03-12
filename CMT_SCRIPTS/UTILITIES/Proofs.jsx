/**
 * Changes the color of all spot swatches in the document with 'White' in the name to pure white.
 */
function toProofWhite() {
  for (var i = 0; i < app.activeDocument.spots.length; i++) {
    var whiteName = /white/i;
    if (!whiteName.test(app.activeDocument.spots[i].name)) continue;

    switch (app.activeDocument.spots[i].spotKind) {
      case SpotColorKind.SPOTCMYK:
        var newCMYK = new CMYKColor();
        newCMYK.cyan = newCMYK.magenta = newCMYK.yellow = newCMYK.black = 0;
        app.activeDocument.spots[i].color = newCMYK;
        break;

      case SpotColorKind.SPOTLAB:
        var newLAB = new LabColor();
        newLAB.l = 100;
        newLAB.a = newLAB.b = 0;
        app.activeDocument.spots[i].color = newLAB;
        break;

      case SpotColorKind.SPOTRGB:
        var newRGB = new RGBColor();
        newRGB.red = newRGB.green = newRGB.blue = 255;
        app.activeDocument.spots[i].color = newRGB;
        break;

      default:
        break;
    }
  }
}

/**
 *
 * @returns {String} Todays date formatted in M/DD or MM/DD
 */
function dateToday() {
  var date = new Date();
  var todaysDate =
    (date.getMonth() > 8 ? date.getMonth() + 1 : date.getMonth() + 1) +
    "/" +
    (date.getDate() > 9 ? date.getDate() : date.getDate());

  return todaysDate;
}

/**
 * Adds a note to a Proof document
 * @param {String}  note
 * @param {Layer}   layer
 */
function addNote(note, layer) {
  var docRef = app.activeDocument;
  var artboardIndex = docRef.artboards.getActiveArtboardIndex();
  var artboardBounds = docRef.artboards[artboardIndex].artboardRect;

  var newNote = layer.textFrames.add();
  newNote.textRange.characterAttributes.textFont =
    docRef.textFrames.getByName("ART_NUMBER").textRange.characterAttributes.textFont;
  newNote.textRange.contents = note;
  newNote.textRange.characterAttributes.size = 21;
  newNote.textRange.characterAttributes.fillColor = redNoteSwatch();
  newNote.paragraphs[0].justification = Justification.CENTER;

  var isShirt = false;
  var shirtCount = 0;

  for (var i = 0; i < layer.pageItems.length; i++) {
    if (layer.pageItems[i].name === "SHIRT") {
      isShirt = true;
      shirtCount++;
    }
  }

  if (isShirt && shirtCount === 1) {
    var theShirt = layer.pageItems.getByName("SHIRT");
    var notePosY = theShirt.position[1] + newNote.height + 5;

    newNote.position = [(artboardBounds[2] - artboardBounds[0]) / 2 - newNote.width / 2, notePosY];
  } else {
    newNote.position = [(artboardBounds[2] - artboardBounds[0]) / 2 - newNote.width / 2, -72];
  }
}

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

/**
 * Centers item vertically & horizontally on the current artboard.
 * @param {PathItem|any} item Selected art or path item
 * @param {Artboard} artboard Current artboard
 */
function centerOnArtboard(item, artboard) {
  var artboard_x = artboard.artboardRect[0] + artboard.artboardRect[2];
  var artboard_y = artboard.artboardRect[1] + artboard.artboardRect[3];
  var x = (artboard_x - item.width) / 2;
  var y = (artboard_y + item.height) / 2;
  item.position = [x, y];
}

/**
 * Moves art and it's background to desired location if it overflows into the header area of the document.
 * @param {any} art Selected art
 * @param {PathItem} background Background color path behind art
 */
function toTallPosition(art, background) {
  var yPositionBackground = -72.1862885521377;
  var backgroundOffset = (background.position[1] - yPositionBackground) * -1;

  if (background.position[1] > yPositionBackground) {
    art.translate(0, backgroundOffset);
    background.translate(0, backgroundOffset);
  }
}
