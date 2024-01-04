function RTF_SaveFile() {
  // Folder where the document will be saved
  // Update this path to where you want your files saved
  var destinationFolder = "~/Desktop/- WORKING DAY -/";

  // Active Document
  var doc = app.activeDocument;

  // Metadata layer
  var metadataLayer = doc.layers.getByName("Metadata");

  // Text in Metadata's ART FILE text frame
  var metaArtFileText = metadataLayer.textFrames.getByName("ART FILE").contents;

  // Extract the art number from text frame
  var artNumber = metaArtFileText.replace(/ART FILE: /gi, "");

  // Create file name with appropriate ending
  var fileName = artNumber + "sc" + " " + "(RTF)" + ".ai";

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
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "RTF_Template") {
    RTF_SaveFile();
  } else {
    throw new Error("RTF Template File Not Active");
  }
} catch (e) {
  alert(e, "Script Alert", true);
}
