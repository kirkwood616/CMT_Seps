function SP_PageProof_FromTemplate() {
  // Illustrator Coordinate System
  app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;

  // Active Document
  var doc = app.activeDocument;

  // Metadata items
  var metadataLayer = doc.layers.getByName("Metadata");
  var metaOrder = metadataLayer.textFrames.getByName("_ORDER");
  var metaArtFile = metadataLayer.textFrames.getByName("_ART FILE");

  // Values for order & art file
  var order = metaOrder.textRange.contents;
  var artFile = metaArtFile.textRange.contents;

  // Exit if art not selected
  if (doc.selection.length < 1) {
    throw new Error("Select Art Before Running.");
  }

  // Copy art
  app.copy();

  // Open & reset active document to proof template
  app.open(new File("~/Desktop/PAGE_PROOF.ait"));
  doc = app.activeDocument;

  // Artboard
  var artboardIndex = doc.artboards.getActiveArtboardIndex();
  var artBoard = doc.artboards[artboardIndex];

  // PROOF layer items
  var proofLayer = doc.layers.getByName("PROOF");
  var shirt = proofLayer.pathItems.getByName("SHIRT");
  var orderNumber = proofLayer.textFrames.getByName("ORDER_NUMBER");
  var artNumber = proofLayer.textFrames.getByName("ART_NUMBER");

  doc.activeLayer = proofLayer;

  // Set order number & art number values
  orderNumber.textRange.contents = order.replace(/ORDER /gi, "ORDER: ");
  artNumber.textRange.contents = "ART #: " + artFile;

  // Paste copied art
  app.paste();
  var pastedArt = doc.selection[0];

  // Resize art to 7.5" wide if over
  if (pastedArt.width > 540) {
    var xScaleBy = (540 / pastedArt.width) * 100;
    pastedArt.resize(xScaleBy, xScaleBy);
  }

  // Resize art to 9.25" high if over
  if (pastedArt.height > 666) {
    var yScaleBy = (666 / pastedArt.height) * 100;
    pastedArt.resize(yScaleBy, yScaleBy);
  }

  // Resize shirt w/ 0.50" margins
  shirt.width = pastedArt.width + 36;
  shirt.height = pastedArt.height + 36;

  // Center art & shirt on artboard
  centerOnArtboard(pastedArt, artBoard);
  centerOnArtboard(shirt, artBoard);

  // Position art & shirt if overlap into header
  toTallPosition(pastedArt, shirt);

  // Deselect everything
  doc.selection = false;

  // Set Due Date
  var dueDate = proofLayer.textFrames.getByName("DUE");
  var currentDueDate = dueDate.textRange.contents.replace(/DUE: /gi, "");
  var newDueDate = prompt("ENTER DUE DATE", currentDueDate, "DUE DATE");

  if (newDueDate) {
    dueDate.textRange.contents = "DUE: " + newDueDate;
  }
}

// Run
try {
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "SP_Template") {
    SP_PageProof_FromTemplate();
  } else {
    throw new Error("SP Template File Not Active");
  }
} catch (e) {
  alert(e, "Script Alert", true);
}

/**
 * Centers item vertically & horizontally on the current artboard.
 * @param {PathItem|any} item Selected art or path item
 * @param {Artboard} artboard Current artboard
 */
function centerOnArtboard(item, artboard) {
  var artboard_x = artboard.artboardRect[0] + artboard.artboardRect[2];
  var artboard_y = artboard.artboardRect[1] + artboard.artboardRect[3];
  var x = (artboard_x - item.width) / 2;
  var y = (artboard_y + item.height) / 2;
  item.position = [x, y];
}

/**
 * Moves art and it's background to desired location if it overflows into the header area of the document.
 * @param {any} art Selected art
 * @param {PathItem} background Background color path behind art
 */
function toTallPosition(art, background) {
  var yPositionBackground = -72.1862885521377;
  var yPositionArt = yPositionBackground + 18;
  var backgroundOffset = (background.position[1] - yPositionBackground) * -1;
  var artOffset = art.position[1] - yPositionArt;

  if (background.position[1] > yPositionBackground) {
    $.writeln("true");
    $.writeln(artOffset);
    art.translate(0, backgroundOffset);
    background.translate(0, backgroundOffset);
  }
}