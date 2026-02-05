/**
 * Takes an array of RGB values and returns an array of converted CMYK values.
 * @param {Array.<number>}  rgbValues Array of RGB values
 * @returns                 Array of converted CMYK values
 */
function convertRGBtoCMYK(rgbValues) {
  var roundColors = [Math.round[0], Math.round[1], Math.round[2]];

  return app.convertSampleColor(
    ImageColorSpace["RGB"],
    rgbValues,
    ImageColorSpace["CMYK"],
    ColorConvertPurpose.defaultpurpose
  );
}

/**
 * Changes the color of all spot swatches in the document with 'White' in the name to pure white.
 */
function toPureWhite() {
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
