function RTF_OverprintFill_False() {
  // Active Document
  var doc = app.activeDocument;

  // Target art group named "ArtGroup"
  var transferArt = doc.layers.getByName("Transfer Art");

  // Path Items in layer
  var _pathItems = transferArt.pathItems;

  // Compound Path items in layer
  var _compoundPathItems = transferArt.compoundPathItems;

  if (_pathItems.length) {
    // Loop over Path Items & set
    for (var i = 0; i < _pathItems.length; i++) {
      _pathItems[i].fillOverprint = false;
    }
  }

  if (_compoundPathItems.length) {
    // Loop over Compound Path Items
    for (var i = 0; i < _compoundPathItems.length; i++) {
      var _paths = _compoundPathItems[i].pathItems;

      // Loop over Path Items in Compound Path & set
      for (var j = 0; j < _paths.length; j++) {
        _paths[j].fillOverprint = false;
      }
    }
  }
}

// Run
try {
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "RTF_Template") {
    RTF_OverprintFill_False();
  } else {
    throw new Error("RTF Template File Not Active");
  }
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
}
