function RTF_Action_PastePositionUngroup() {
  //@include './RTF_PastePositionArt.jsx';
  //@include './RTF_Ungroup_TransferArt.jsx';
}

// Run
try {
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "RTF_Template") {
    RTF_Action_PastePositionUngroup();
  } else {
    throw new Error("RTF Template File Not Active");
  }
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
}
