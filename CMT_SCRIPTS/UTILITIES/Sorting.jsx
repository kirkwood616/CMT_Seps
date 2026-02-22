/**
 * Sorts a selection by area and rearranges the items' order within the layer
 * @returns {void}
 */
function sortSelectionByArea() {
  // Current selection
  var sel = app.activeDocument.selection;

  // Throw error if no selection
  if (!sel.length) {
    throw new Error("No Selection");
  }

  sel.sort(function (a, b) {
    const areaA = a.width * a.height;
    const areaB = b.width * b.height;
    return areaB - areaA;
  });

  // Arrange items to sorted order
  for (var i = sel.length; i--; ) {
    sel[i].move(
      app.activeDocument.activeLayer,
      ElementPlacement.PLACEATBEGINNING,
    );
  }
}
