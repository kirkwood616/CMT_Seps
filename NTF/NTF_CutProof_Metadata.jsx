function NTF_CutProof_Metadata() {
  // Active Document
  var doc = app.activeDocument;

  // Metadata
  var metadataLayer = doc.layers.getByName("Metadata");
  var metadataFrames = metadataLayer.textFrames;
  var orderNumber = metadataFrames.getByName("ORDER_NUMBER").contents;
  var artNumber = metadataFrames.getByName("ART_NUMBER").contents;
  var dueDate = metadataFrames.getByName("DUE_DATE").contents;

  // WINDOW
  var dialog = new Window("dialog", undefined, undefined, { closeButton: false });
  dialog.text = "SET METADATA";
  dialog.orientation = "column";
  dialog.alignChildren = ["left", "top"];
  dialog.spacing = 10;
  dialog.margins = 25;

  // ORDER #
  var panel_ORDER = dialog.add("panel", undefined, undefined, { name: "panel_ORDER" });
  panel_ORDER.text = "ORDER #";
  panel_ORDER.orientation = "column";
  panel_ORDER.alignChildren = ["left", "top"];
  panel_ORDER.spacing = 10;
  panel_ORDER.margins = 10;

  var input_ORDER = panel_ORDER.add("edittext", undefined, orderNumber);
  input_ORDER.preferredSize.width = 200;

  // ART #
  var panel_ART = dialog.add("panel", undefined, undefined, { name: "panel_ART" });
  panel_ART.text = "ART #";
  panel_ART.orientation = "column";
  panel_ART.alignChildren = ["left", "top"];
  panel_ART.spacing = 10;
  panel_ART.margins = 10;

  var input_ART = panel_ART.add("edittext", undefined, artNumber);
  input_ART.preferredSize.width = 200;

  // DUE DATE
  var panel_DUE = dialog.add("panel", undefined, undefined, { name: "panel_DUE" });
  panel_DUE.text = "DUE DATE";
  panel_DUE.orientation = "column";
  panel_DUE.alignChildren = ["left", "top"];
  panel_DUE.spacing = 10;
  panel_DUE.margins = 10;

  var input_DUE = panel_DUE.add("edittext", undefined, dueDate);
  input_DUE.preferredSize.width = 200;

  // Button control group
  var buttonGroup = dialog.add("group", undefined, { name: "buttonGroup" });
  buttonGroup.orientation = "row";
  buttonGroup.alignChildren = ["center", "fill"];
  buttonGroup.spacing = 10;
  buttonGroup.margins = [2, 18, 2, 2];
  buttonGroup.alignment = ["fill", "top"];

  // Cancel Button
  var cancelButton = buttonGroup.add("button", undefined, undefined, { name: "cancelButton" });
  cancelButton.text = "CANCEL";
  cancelButton.preferredSize.width = 75;
  cancelButton.alignment = ["center", "center"];
  cancelButton.onClick = function () {
    dialog.close();
  };

  // OK Button
  var okButton = buttonGroup.add("button", undefined, undefined, { name: "okButton" });
  okButton.text = "OK";
  okButton.preferredSize.width = 75;
  okButton.onClick = function () {
    // Check for no input & alert
    if (!input_ORDER.text || !input_ART.text || !input_DUE.text) {
      alert("Missing Values" + "\n" + "Enter Values");
    }

    // Set textframes contents & close window
    if (input_ORDER.text && input_ART.text && input_DUE.text) {
      for (var i = 0; i < metadataFrames.length; i++) {
        if (metadataFrames[i].name === "ORDER_NUMBER") metadataFrames[i].contents = input_ORDER.text;
        if (metadataFrames[i].name === "ART_NUMBER") metadataFrames[i].contents = input_ART.text.toUpperCase();
        if (metadataFrames[i].name === "DUE_DATE") metadataFrames[i].contents = input_DUE.text;
      }
      dialog.close();
    }
  };

  // Show WINDOW
  dialog.show();
}

// Run
try {
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name.indexOf("CP_") !== -1) {
    NTF_CutProof_Metadata();
  } else {
    throw new Error("Template File Not Active");
  }
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
}
