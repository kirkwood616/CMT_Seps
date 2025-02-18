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
