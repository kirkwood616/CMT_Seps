function SP_Set_Placement() {
  // Illustrator Coordinate System
  app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;

  // Active Document
  var doc = app.activeDocument;

  // Layers in document
  var docLayers = doc.layers;

  // Metadata
  var metaLayer = docLayers.getByName("Metadata");
  var metaGroup = metaLayer.groupItems.getByName("MetaGroup");

  // Registration
  var regLayer = docLayers.getByName("Registration");
  var regTopCenter = regLayer.groupItems.getByName("REG_TOP_CENTER");
  var regBottomCenter = regLayer.groupItems.getByName("REG_BOTTOM_CENTER");

  // Index to ignore non-art layers
  var skipToIndex = 0;

  // Deselect everything by layer
  for (var i = 0; i < docLayers.length; i++) {
    docLayers[i].hasSelectedArtwork = false;
  }

  // Loop through Layers & make 1 group in layer if not grouped
  for (var i = 0; i < docLayers.length; i++) {
    if (docLayers[i].name === "Guides" || docLayers[i].name === "Registration" || docLayers[i].name === "Metadata") {
      skipToIndex++;
      continue;
    }
    docLayers[i].hasSelectedArtwork = true;

    app.executeMenuCommand("group");

    docLayers[i].hasSelectedArtwork = false;
  }

  // PLACEWINDOW
  // ===========
  var placeWindow = new Window("dialog");
  placeWindow.text = "SET PLACEMENT";
  placeWindow.orientation = "row";
  placeWindow.alignChildren = ["center", "top"];
  placeWindow.spacing = 10;
  placeWindow.margins = 16;

  // PLACEPANEL
  // ==========
  var placePanel = placeWindow.add("panel", undefined, undefined, {
    name: "placePanel",
  });
  placePanel.text = "Placement";
  placePanel.orientation = "row";
  placePanel.alignChildren = ["center", "center"];
  placePanel.spacing = 10;
  placePanel.margins = 10;
  placePanel.alignment = ["center", "fill"];

  var placeValue = 2.0;

  var minusButton = placePanel.add("button", undefined, undefined, {
    name: "minusButton",
  });
  minusButton.text = "-";
  minusButton.onClick = function () {
    placeValue = parseFloat(placeValue) - 0.25;
    placement.text = placeValue;
  };

  var placement = placePanel.add('edittext {justify: "center", properties: {name: "placement", readonly: true}}');
  placement.text = placeValue;
  placement.preferredSize.width = 100;

  var plusButton = placePanel.add("button", undefined, undefined, {
    name: "plusButton",
  });
  plusButton.text = "+";
  plusButton.onClick = function () {
    placeValue = parseFloat(placeValue) + 0.25;
    placement.text = placeValue;
  };

  // QUICKPANEL
  // ==========
  var quickPanel = placeWindow.add("panel", undefined, undefined, {
    name: "quickPanel",
  });
  quickPanel.text = "Quick Select";
  quickPanel.orientation = "column";
  quickPanel.alignChildren = ["center", "top"];
  quickPanel.spacing = 10;
  quickPanel.margins = 10;

  // Values for Quick Placement
  var quickValues = [2, 3, 3.5, 4, 5, 5.5, 6, 6.5];

  for (var i = 0; i < quickValues.length; i++) {
    var quickButton = quickPanel.add("button", undefined, undefined, { name: quickValues[i] });
    quickButton.text = quickValues[i] + "\u0022";
    quickButton.onClick = function () {
      var newValue = this.text.substring(0, this.text.length - 1);
      placeValue = newValue;
      placement.text = placeValue;
    };
  }

  // BUTTONGROUP
  // ===========
  var buttonGroup = placeWindow.add("group", undefined, { name: "buttonGroup" });
  buttonGroup.orientation = "column";
  buttonGroup.alignChildren = ["left", "top"];
  buttonGroup.spacing = 10;
  buttonGroup.margins = 0;

  var okButton = buttonGroup.add("button", undefined, "OK");

  var cancelButton = buttonGroup.add("button", undefined, "CANCEL");

  // OK Button Click + Movement
  okButton.onClick = function () {
    var newPlacement = parseFloat(placement.text);
    var yPosOrigin = 0;
    var yDifference = 0;

    // Deselect everything
    doc.selection = null;

    // Get Y Position of main Art
    for (var i = skipToIndex; i < docLayers.length; i++) {
      if (docLayers[i].pageItems.length < 1) continue;
      if (docLayers[i].name.indexOf("UB") !== -1) continue;
      yPosOrigin = docLayers[i].pageItems[0].position[1];
    }

    // Calculate difference in current placement to new placement
    var placementPoints = (newPlacement - 1) * 72;
    yDifference = (yPosOrigin + placementPoints) * -1;

    // Move items to new placement position
    for (var i = skipToIndex; i < docLayers.length; i++) {
      if (docLayers[i].pageItems.length < 1) continue;
      docLayers[i].hasSelectedArtwork = false;
      docLayers[i].hasSelectedArtwork = true;
      doc.selection[0].translate(0, yDifference);
      doc.selection = null;
    }

    // Move Top Registration Mark & Metadata
    if (newPlacement < 2.5) {
      regTopCenter.position = [553.22509765623, -9];
      metaGroup.position = [487.296692817155, -8.99994692380005];
    } else {
      regTopCenter.position = [553.22509765623, -49.7246093738895];
      metaGroup.position = [487.296692817155, -49.7230914550501];
    }

    // Move Bottom Registration Mark
    regBottomCenter.translate(0, yDifference);

    // Move CW_ text frames (if there)
    var metaTF = metaLayer.textFrames;

    if (metaTF.length > 0) {
      for (var i = 0; i < metaTF.length; i++) {
        if (metaTF[i].contents.indexOf("CW_") !== -1) {
          metaTF[i].translate(0, yDifference);
        }
      }
    }

    // Close Window
    placeWindow.close();
  };

  // Show Window
  placeWindow.show();
}

// Run
try {
  if (app.documents.length > 0 && app.activeDocument.artboards[0].name === "SP_Template") {
    SP_Set_Placement();
  } else {
    throw new Error("SP Template File Not Active");
  }
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
}
