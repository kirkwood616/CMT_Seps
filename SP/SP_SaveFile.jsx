function SP_SaveFile() {
  // Folder where the document will be saved
  // Update this path to where you want your files saved
  var destinationFolder = "~/Desktop/- WORKING DAY -/";

  // Active Document
  var doc = app.activeDocument;

  // Metadata layer
  var metadataLayer = doc.layers.getByName("Metadata");
  var metaLocation = metadataLayer.textFrames.getByName("_LOCATION").contents.toLowerCase();
  var metaArtFile = metadataLayer.textFrames.getByName("_ART FILE").contents;

  // Create file name with appropriate ending
  var fileName = metaArtFile + metaLocation + ".ai";

  try {
    // Save file
    doc.saveAs(new File(destinationFolder + fileName));

    // Alert
    alert("File Saved" + "\n" + destinationFolder + fileName);
  } catch (e) {
    throw new Error(e);
  }
}

// Run
try {
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "SP_Template") {
    SP_SaveFile();
  } else {
    throw new Error("SP Template File Not Active");
  }
} catch (e) {
  alert(e, "Script Alert", true);
}
