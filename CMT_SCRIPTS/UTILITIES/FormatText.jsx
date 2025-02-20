//@include '../UTILITIES/Polyfills.js';

/**
 * Takes an art file name & formats it removing file extension, parenthesis & its contents, and any file name suffix after the standard art file name format.
 * @param {String}    artName Art file name
 * @returns {String}  Formatted art name
 * @example 25-MK-1234-5678-1(1).ai => 25-MK-1234
 */
function formatArtName(artName) {
  var newArtName = artName
    .replace(/.ai/gi, "")
    .replace(/\s*\(.*?\)\s*/g, "")
    .split("-", 3)
    .join("-");

  switch (true) {
    case newArtName.indexOf("sc") > -1:
    case newArtName.indexOf("sl") > -1:
    case newArtName.indexOf("sr") > -1:
    case newArtName.indexOf("pk") > -1:
    case newArtName.indexOf("ud") > -1:
      newArtName = newArtName.substring(0, newArtName.length - 2);
      break;
    case newArtName.indexOf("yoke") > -1:
      newArtName = newArtName.substring(0, newArtName.length - 4);
      break;
    default:
      break;
  }

  return newArtName;
}

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
