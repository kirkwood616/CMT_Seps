function NTF_Organize_ByWidth() {
  // Active Document
  var doc = app.activeDocument;

  // Current selection
  var sel = doc.selection;

  // Exit if no selection
  if (!sel.length) {
    throw new Error("No Selection");
  }

  // GUI Window
  var dialog = new Window("dialog", undefined, undefined, { closeButton: false });
  dialog.text = "ORGANIZE BY WIDTH";
  dialog.orientation = "column";
  dialog.alignChildren = ["left", "top"];
  dialog.spacing = 10;
  dialog.margins = 25;

  // Radio buttons
  var radioSmallToLarge = dialog.add("radiobutton", undefined, "small - LARGE");
  radioSmallToLarge.value = true;
  var radioLargeToSmall = dialog.add("radiobutton", undefined, "LARGE - small");

  // Button Control Group
  var buttonGroup = dialog.add("group", undefined, { name: "buttonGroup" });
  buttonGroup.orientation = "row";
  buttonGroup.alignChildren = ["fill", "fill"];
  buttonGroup.spacing = 10;
  buttonGroup.margins = [2, 18, 2, 2];
  buttonGroup.alignment = ["fill", "fill"];

  // Cancel Button
  var cancelButton = buttonGroup.add("button", undefined, "CANCEL");
  cancelButton.onClick = function () {
    dialog.close();
  };

  // OK Button
  var okButton = buttonGroup.add("button", undefined, "OK");
  okButton.onClick = function () {
    var isSmallToLarge = true;

    if (radioLargeToSmall.value) {
      isSmallToLarge = false;
    }

    // Positions
    var xPosition = sel[sel.length - 1].position[0];
    var yPositionLastItem = getLastPositionY(sel);

    // Sort selection by item width
    if (isSmallToLarge) {
      sel.sort(function (a, b) {
        return a.width - b.width;
      });
    } else {
      sel.sort(function (a, b) {
        return b.width - a.width;
      });
    }

    // Organize items by width + 0.5" gap between
    var itemPositionY = yPositionLastItem;

    for (var i = sel.length; i--; ) {
      sel[i].move(doc.activeLayer, ElementPlacement.PLACEATBEGINNING);

      if (i !== sel.length - 1) {
        itemPositionY += sel[i].height + 36;
      }

      sel[i].position = [xPosition, itemPositionY];
    }

    // Close Window
    dialog.close();
  };

  // Show Window
  dialog.show();
}

// Run
try {
  if (app.documents.length > 0) {
    NTF_Organize_ByWidth();
  } else {
    throw new Error("Template File Not Active");
  }
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
}

//*******************
// Helper functions
//*******************

function getLastPositionY(items) {
  var yPositions = new Array();

  for (var i = 0; i < items.length; i++) {
    yPositions.push(items[i].position[1]);
  }
  yPositions.sort(function (a, b) {
    return b - a;
  });

  return yPositions[yPositions.length - 1];
}
