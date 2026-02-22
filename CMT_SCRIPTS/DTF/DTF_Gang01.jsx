//@include '../UTILITIES/packer.js';
//@include '../UTILITIES/Sorting.jsx';

function DTF_Gang01() {
  // Illustrator Coordinate System
  app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;

  // Active Document
  var doc = app.activeDocument;
  var abWidth = doc.artboards[0].artboardRect[2];
  var abHeight = doc.artboards[0].artboardRect[3] * -1;
  var sel = doc.selection;

  // Throw error if no selection
  if (!sel.length) {
    throw new Error("No Selection");
  }

  // Sort selection
  sortSelectionByArea();

  // Reset selection to sorted selection
  sel = doc.selection;

  // Blocks store
  var blocks = new Array();

  for (var i = 0; i < sel.length; i++) {
    var dim = { w: sel[i].width + 18 * 2, h: sel[i].height + 18 * 2 };
    blocks.push(dim);
  }

  var packer = new Packer(abWidth, abHeight);
  packer.fit(blocks);

  for (var n = 0; n < blocks.length; n++) {
    var block = blocks[n];
    if (block.fit) {
      sel[n].position = [block.fit.x, block.fit.y * -1];
    }
  }
}

// Run
try {
  if (
    app.documents.length > 0 &&
    app.activeDocument.artboards[0].name === "DTF_Template"
  ) {
    DTF_Gang01();
  } else {
    throw new Error("Template File Not Active");
  }
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
}
