function RTF_OrderArtPrompt() {
  // Active Document
  var doc = app.activeDocument;

  // Target Metadata layer, Order & Art File text frames
  var metadataLayer = doc.layers.getByName("Metadata");
  var orderName = metadataLayer.textFrames.getByName("ORDER");
  var artName = metadataLayer.textFrames.getByName("ART FILE");

  // Remove leading text in Order & Art File text frames
  var orderNameText = orderName.contents.replace("ORDER ", "");
  var artNameText = artName.contents.replace("ART FILE: ", "");

  // Prompts to get Order Number & Art File Names
  var orderNumber = prompt("Enter Order Number", orderNameText, "Order Number");
  var artFile = prompt("Enter Art File", artNameText, "Order Number").toUpperCase();

  // Error handling for if no value or CANCEL button is selected
  if (!orderNumber || !artFile) {
    alert("Value(s) Missing\nRe-Run Script & Enter Values");
    return;
  }

  // Set Order & Art File Text
  orderName.contents = "ORDER " + orderNumber;
  artName.contents = "ART FILE: " + artFile;
}

// Run
try {
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "RTF_Template") {
    RTF_OrderArtPrompt();
  } else {
    throw new Error("RTF Template File Not Active");
  }
} catch (e) {
  alert(e, "Script Alert", true);
}
