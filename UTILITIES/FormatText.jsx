//@include '../UTILITIES/Polyfills.js';

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

/**
 * Extracts screen mesh indicator suffix without preceeding 'M'
 * @param {String}          colorName Name of color
 * @param {Array.<string>}  meshArray Array of mesh counts (i.e. '156')
 * @returns {String}
 */
function extractMeshSuffix(colorName, meshArray) {
  var meshSuffix = "";
  var lastSpace = colorName.lastIndexOf(" ");

  if (colorName[lastSpace + 1] === "M") {
    var lastText = colorName.slice(lastSpace + 2, colorName.length);

    for (var i = 0; i < meshArray.length; i++) {
      if (meshArray[i] === lastText) {
        meshSuffix = lastText;
      }
    }
  }

  return meshSuffix;
}

/**
 * Removes screen mesh indicator suffix (i.e. 'M156')
 * @param {String}          colorName Name of color
 * @param {Array.<String>}  meshArray Array of mesh counts (i.e. '156')
 * @returns {String}
 */
function removeMeshSuffix(colorName, meshArray) {
  var newName = "";
  var isMesh = false;
  var lastSpace = colorName.lastIndexOf(" ");

  if (colorName[lastSpace + 1] === "M") {
    var lastText = colorName.slice(lastSpace + 2, colorName.length);
    var meshDigits = parseInt(lastText.slice(0, 2));

    for (var i = 0; i < meshArray.length; i++) {
      if (meshArray[i] === lastText) {
        isMesh = true;
        newName = colorName.slice(0, lastSpace);
      }
    }

    if (!isNaN(meshDigits)) {
      isMesh = true;
      newName = colorName.slice(0, lastSpace);
    }
  }

  if (isMesh) {
    return newName;
  } else {
    return colorName;
  }
}

/**
 * Removes white space from the start and end of every swatch's name in the document.
 * @returns {void}
 */
function trimSwatchNames() {
  for (var i = 0; i < app.activeDocument.swatches.length; i++) {
    app.activeDocument.swatches[i].name = app.activeDocument.swatches[i].name.trim();
  }
}
