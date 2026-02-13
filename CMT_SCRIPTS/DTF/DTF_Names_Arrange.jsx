function DTF_Names_Arrange() {
  // Illustrator Coordinate System
  app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;

  // Active Document
  var doc = app.activeDocument;
  var artBoard = doc.artboards[0];
  var artboardLeft = artBoard.artboardRect[0];
  var artboardRight = artBoard.artboardRect[2];
  var artboardBottom = artBoard.artboardRect[3];

  // Current Selection
  var sel = doc.selection;

  // Exit if no selection
  if (!sel.length) {
    throw new Error("No Selected Art" + "\n" + "Select Names Before Running.");
  }

  // Copy array of selection
  var selCopy = sel.slice();

  // Storage for matches
  var matchStore = new Array();

  // Hash table
  var hash = {};

  // Loop selection in reverse order from largest to smallest width
  for (var i = sel.length; i--; ) {
    // Skip if item index is in hash table
    if (hash[i]) continue;

    // Add current item to hash table
    hash[i] = 1;

    // Array for matches
    var matches = new Array();

    // Add current item's index to matches array
    matches.push(i);

    // Width log, starting with current item's width
    var widthLog = sel[i].width;

    // Loop matching copy in same reverse order\
    for (var j = selCopy.length; j--; ) {
      // Skip if item index is in hash table
      if (hash[j]) continue;

      // Check if items' width + 0.50" (36) margin is less or equal to usable width space
      if (widthLog + selCopy[j].width + 36 <= artboardRight) {
        // Add item's index to hash table & matches array
        hash[j] = 1;
        matches.push(j);

        // Add item's width + margin to width log
        widthLog += selCopy[j].width + 36;
      }
    }

    // Add matches array to the matchStore array
    matchStore.push(matches);
  }

  // Sort matches by match-length and physical width (large to small)
  matchStore.sort(function (a, b) {
    return b.length - a.length;
  });

  var singleIndex = 0;

  for (var i = 0; i < matchStore.length; i++) {
    if (matchStore[i].length === 1) {
      singleIndex = i;
      break;
    }
  }

  var unsorted = matchStore.slice(singleIndex);
  matchStore.length = singleIndex;
  unsorted.sort(function (a, b) {
    return sel[b[0]].width - sel[a[0]].width;
  });
  matchStore.sort(function (a, b) {
    return sel[b[0]].width - sel[a[0]].width;
  });
  matchStore.push.apply(matchStore, unsorted);

  // Active layer
  var activeLayer = doc.activeLayer;

  // Bottom start position (bottom of artboard)
  var yPosition = artboardBottom;

  // Loop matchStore array (of arrays)
  for (var i = 0; i < matchStore.length; i++) {
    var matchSet = matchStore[i];
    var lastIndex = matchSet.length - 1;
    var lastItem = matchSet[lastIndex];

    // Add new line w/ margin into yPosition tracker
    yPosition += sel[matchSet[0]].height;
    if (i > 0) yPosition += 36;

    // First item always aligned to left guide, or centered if only 1 item
    sel[matchSet[0]].position = [artboardLeft, yPosition];
    if (matchSet.length === 1) {
      sel[matchSet[0]].position = [
        (artboardRight - sel[matchSet[0]].width) / 2,
        yPosition,
      ];
    }
    sel[matchSet[0]].move(activeLayer, ElementPlacement.PLACEATEND);

    // Last item always aligned to right
    if (matchSet.length > 1) {
      var lastItemRight = artboardRight - sel[lastItem].width;
      sel[lastItem].position = [lastItemRight, yPosition];
      sel[lastItem].move(activeLayer, ElementPlacement.PLACEATEND);
    }

    // Position lines over 2 items spacing evenly
    if (matchSet.length > 2) {
      var xPositionFirstItem = sel[matchSet[0]].width;
      var gap = sel[lastItem].position[0] - xPositionFirstItem;
      var centerItemsWidth = 0;

      // Populate total width of items to place into centerItemsWidth
      for (var j = 1; j < matchSet.length; j++) {
        if (j === lastIndex) break;
        centerItemsWidth += sel[matchSet[j]].width;
      }

      // Calculate margin between each item
      var marginSpace = (gap - centerItemsWidth) / (matchSet.length - 1);
      // Value of new X position for each item
      var xPosLog = xPositionFirstItem + marginSpace;

      // Position item & update X position
      for (var k = 1; k < matchSet.length; k++) {
        if (k === lastIndex) break;
        sel[matchSet[k]].position = [xPosLog, yPosition];
        sel[matchSet[k]].move(activeLayer, ElementPlacement.PLACEATEND);
        xPosLog += sel[matchSet[k]].width + marginSpace;
      }
    }
  }

  // Resize artboard to visible bounds
  artBoard.artboardRect = doc.visibleBounds;

  // Zoom to fit selection
  //@include '../UTILITIES/ZoomAndCenterSelection.jsx';

  // Deselect everything
  doc.selection = null;
}

// Run
try {
  if (app.documents.length > 0) {
    DTF_Names_Arrange();
  } else {
    throw new Error("Template File Not Active");
  }
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
}
