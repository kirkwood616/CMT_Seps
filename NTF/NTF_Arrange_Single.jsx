//@include '../UTILITIES/FormatText.jsx';
//@include '../UTILITIES/Polyfills.js';

function NTF_Arrange_Single() {
  // Active Document
  var doc = app.activeDocument;

  // Current Selection
  var sel = doc.selection;

  // Exit if no selection
  if (!sel.length) {
    throw new Error("No Selected Art" + "\n" + "Select Art Before Running.");
  }

  // Overprint Fill selection
  //@include '../UTILITIES/Overprint_Fill_True.jsx';

  // Swatches
  var docSwatches = doc.swatches;

  // Get swatch name
  var colorSwatch = "";

  for (var i = 0; i < docSwatches.length; i++) {
    if (docSwatches[i].name !== "[None]" && docSwatches[i].name !== "[Registration]") {
      colorSwatch = removeUnwantedChars(docSwatches[i].name).trim().toUpperCase();
      docSwatches[i].name = colorSwatch + "_1";
    }
  }

  // Rename active (art) layer to new swatch name
  var activeLayer = doc.activeLayer;
  activeLayer.name = colorSwatch + "_1";

  // Artboard
  var artBoard = doc.artboards[0];
  var artboard_x = artBoard.artboardRect[0] + artBoard.artboardRect[2];
  var artboard_y = artBoard.artboardRect[1] + artBoard.artboardRect[3];

  // Center horizontally each item on artboard
  for (var i = 0; i < sel.length; i++) {
    sel[i].position = [(artboard_x - sel[i].width) / 2, sel[i].position[1]];
  }

  // Group, position vertically centered to artboard & ungroup
  app.executeMenuCommand("group");
  doc.selection[0].position = [doc.selection[0].position[0], (artboard_y + doc.selection[0].height) / 2];
  app.executeMenuCommand("ungroup");

  // Deselect everything
  doc.selection = null;
}

// Run
try {
  if (app.documents.length > 0) {
    NTF_Arrange_Single();
  } else {
    throw new Error("Template File Not Active");
  }
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
}
