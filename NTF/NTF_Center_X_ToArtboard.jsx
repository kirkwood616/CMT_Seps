function NTF_Center_X_ToArtboard() {
  // Active Document
  var doc = app.activeDocument;

  // Current Selection
  var sel = doc.selection;

  // Exit if no selection
  if (!sel.length) {
    throw new Error("No Selected Art" + "\n" + "Select Art Before Running.");
  }

  // Artboard
  var artBoard = doc.artboards[0];
  var artboard_x = artBoard.artboardRect[0] + artBoard.artboardRect[2];

  // Center horizontally each item on artboard
  for (var i = 0; i < sel.length; i++) {
    sel[i].position = [(artboard_x - sel[i].width) / 2, sel[i].position[1]];
  }
}

// Run
try {
  if (app.documents.length > 0) {
    NTF_Center_X_ToArtboard();
  } else {
    throw new Error("File Not Active");
  }
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
}
