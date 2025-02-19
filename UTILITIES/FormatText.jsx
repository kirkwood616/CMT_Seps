/**
 * Returns a new string removing occurrences of '/', '\\', 'Spot', 'Pantone'
 * and any characters contained within parenthesis, along with the parenthesis themselves.
 * @param {String}    theString
 * @returns {String}  Formatted String
 */
function removeUnwantedChars(theString) {
  return theString
    .replace(/\//g, "")
    .replace(/\\/g, "")
    .replace(/SPOT /gi, "")
    .replace(/PANTONE /gi, "")
    .replace(/\s*\(.*?\)\s*/g, " ");
}
