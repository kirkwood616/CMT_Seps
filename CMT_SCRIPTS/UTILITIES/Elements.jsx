/**
 * Takes a Group and returns true if any of the items are spaced at or more than
 * 0.75" lower than the first item in the Group on the Y-axis. Returns false if
 * items are within 0.75" of the first item's Y-position.
 * @param {Group}     selGroup
 * @returns {Boolean}
 */

function isGroupMultiline(selGroup) {
  var isMultiline = false;
  var startPosition = selGroup.pageItems[0].position[1];

  for (var i = 0; i < selGroup.pageItems.length; i++) {
    if (
      selGroup.pageItems[i].position[1] >= startPosition + 108 ||
      selGroup.pageItems[i].position[1] <= startPosition - 108
    ) {
      isMultiline = true;
      break;
    }
  }

  return isMultiline;
}
