function NTF_Open_Template_FromFile() {
  // Active Document
  var fileDoc = app.activeDocument;

  // Selection
  var sel = fileDoc.selection;

  // Exit if art not selected
  if (fileDoc.selection.length < 1) {
    throw new Error("Select Art Before Running.");
  }

  // Copy selection
  app.copy();

  // Path for Cut Proof Template
  var templateDocPath = "~/Desktop/Illustrator_Scripts/CMT_Seps/templates/NTF_Template.ait";

  // Open Cut Proof Template
  app.open(new File(templateDocPath));

  // Open Template
  var templateDoc = app.activeDocument;

  // Target Transfer Art layer, make active, paste selection & group art
  var artLayer = templateDoc.layers.getByName("Transfer Art");
  templateDoc.activeLayer = artLayer;
  app.paste();
  app.executeMenuCommand("group");

  // NTF_Template artboard info
  var templateArtBoard = templateDoc.artboards[0];
  var templateRect = templateArtBoard.artboardRect;

  // Reset selection to pasted art & position to edge of template artboard
  sel = templateDoc.selection[0];
  sel.position = [templateRect[0] - sel.width, sel.position[1]];

  // Ungroup art
  app.executeMenuCommand("ungroup");
}

// Run
try {
  if (app.documents.length > 0) {
    NTF_Open_Template_FromFile();
  } else {
    throw new Error("No Document Active");
  }
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
}
