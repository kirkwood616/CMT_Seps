function NTF_Arrange() {
  // Active Document
  var doc = app.activeDocument;

  // Current Selection
  var sel = doc.selection;

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
      if (widthLog + selCopy[j].width + 36 <= 1080) {
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

  // 1080 = 15" MAX WIDTH
  // 1440 = 20" MAX HEIGHT (1449 = 20.125" ext HEIGHT)
  // 54 = 0.75"
  // 36 = 0.50"

  // 1620 bottom guide
  // 1588.3859 bottom starting position
  // 36 left guide
  // 1116 right guide

  // Bottom start position
  var yPosition = -1588.3859;

  // Loop matchStore array
  for (var i = 0; i < matchStore.length; i++) {
    var matchSet = matchStore[i];
    var lastIndex = matchSet.length - 1;
    var lastItem = matchSet[lastIndex];

    // Add new line w/ margin into yPosition tracker
    yPosition += sel[matchSet[0]].height;
    if (i > 0) yPosition += 36;

    // First item always aligned to left guide
    sel[matchSet[0]].position = [36, yPosition];

    // Last item always aligned to right guide
    if (matchSet.length > 1) {
      var lastItemRight = 1116 - sel[matchSet[lastIndex]].width;
      sel[matchSet[lastIndex]].position = [lastItemRight, yPosition];
    }

    // Position lines over 2 items spacing evenly
    if (matchSet.length > 2) {
      var xPositionFirstItem = 36 + sel[matchSet[0]].width;
      var gap = sel[matchSet[lastIndex]].position[0] - xPositionFirstItem;
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
        xPosLog += sel[matchSet[k]].width + marginSpace;
      }
    }
  }
}

// Run
try {
  if (app.documents.length > 0) {
    NTF_Arrange();
  } else {
    throw new Error("Template File Not Active");
  }
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
}
