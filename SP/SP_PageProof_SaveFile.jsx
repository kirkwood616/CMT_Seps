function SP_PageProof_SaveFile() {
  // Folder where the document will be saved
  // Update this path to where you want your files saved
  var destinationFolder = "~/Desktop/- WORKING DAY -/PAGE_PROOFS/";

  // Active Document
  var doc = app.activeDocument;

  // PROOF layer items
  var proofLayer = doc.layers.getByName("PROOF");
  var artNumber = proofLayer.textFrames.getByName("ART_NUMBER");
  var artNumberText = artNumber.textRange.contents.replace(/ART #: /gi, "").toUpperCase();

  // Create file name with appropriate ending
  var fileName = artNumberText + " (PAGE_PROOF)" + ".ai";

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
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "PAGE_PROOF") {
    SP_PageProof_SaveFile();
  } else {
    throw new Error("PAGE_PROOF Template Not Active");
  }
} catch (e) {
  alert(e, "Script Alert", true);
}
