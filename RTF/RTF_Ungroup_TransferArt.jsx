function RTF_Ungroup_TransferArt() {
  // Active Document
  var doc = app.activeDocument;

  // Layers in document
  var docLayers = doc.layers;

  // Lock all layers except Transfer Art layer
  for (var i = 0; i < docLayers.length; i++) {
    if (docLayers[i].name !== "Transfer Art") {
      docLayers[i].locked = true;
    }
  }

  // Ungroupable items
  var itemKinds = new Array(
    "pathItems",
    "compoundPathItems",
    "textFrames",
    "placedItems",
    "rasterItems",
    "meshItems",
    "pluginItems",
    "graphItems",
    "symbolItems",
    "groupItems"
  );

  function getAllChildren(obj) {
    var childsArr = new Array();
    for (var i = 0; i < obj.pageItems.length; i++) childsArr.push(obj.pageItems[i]);
    return childsArr;
  }

  function ungroup(obj) {
    var elements = getAllChildren(obj);
    if (elements.length < 1) {
      return;
    } else {
      for (var i = 0; i < elements.length; i++) {
        try {
          if (elements[i].parent.typename !== "Layer") elements[i].moveBefore(obj);
          if (elements[i].typename === "GroupItem") ungroup(elements[i]);
        } catch (e) {}
      }
    }
  }

  if (doc.groupItems.length) {
    for (var i = 0; i < doc.layers.length; i++) {
      ungroup(doc.layers[i]);
    }
  }
}

// Run
try {
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "RTF_Template") {
    RTF_Ungroup_TransferArt();
  } else {
    throw new Error("RTF Template File Not Active");
  }
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
}
