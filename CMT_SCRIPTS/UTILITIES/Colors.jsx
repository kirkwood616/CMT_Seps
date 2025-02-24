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
