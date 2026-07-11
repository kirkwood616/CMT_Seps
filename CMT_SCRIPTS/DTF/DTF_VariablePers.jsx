//@include '../UTILITIES/Settings.jsx';

// *****************************
// USER INPUT WINDOW
// *****************************
function DTF_VariablePers_InputWindow() {
  // Exit if no Dataset is loaded
  if (!app.activeDocument.dataSets.length) {
    throw new Error(
      "No Variable Dataset Loaded" +
        "\n\n" +
        "Load A Dataset In the Variables Window",
    );
  }

  // Exported Value
  var userValue;

  // GUI
  // ===
  var gui = new Window("dialog");
  gui.text = "Name Width Limit";
  gui.preferredSize.width = 350;
  gui.orientation = "column";
  gui.alignChildren = ["center", "top"];
  gui.spacing = 10;
  gui.margins = 16;

  // GROUP1
  // ======
  var inputGroup = gui.add("group", undefined, { name: "inputGroup" });
  inputGroup.orientation = "row";
  inputGroup.alignChildren = ["left", "center"];
  inputGroup.spacing = 10;
  inputGroup.margins = 0;

  var STATIC_limitInput = inputGroup.add("statictext", undefined, undefined, {
    name: "STATIC_limitInput",
  });
  STATIC_limitInput.text = "Max Name Width (inches):";

  var limitValue = inputGroup.add(
    'edittext {justify: "center", properties: {name: "limitValue"}}',
  );
  limitValue.text = "12";
  limitValue.preferredSize.width = 75;
  limitValue.onChanging = function () {
    if (isNaN(this.text)) {
      alert("Only Numeric Values Allowed");
      this.text = "12";
    }
  };

  var upButton = inputGroup.add("button", undefined, undefined, {
    name: "upButton",
  });
  upButton.helpTip = "Increments of 0.25";
  upButton.text = "↑";
  upButton.preferredSize.width = 40;
  upButton.onClick = function () {
    if (isNaN(parseFloat(limitValue.text))) {
      limitValue.text = "12";
    } else {
      limitValue.text = String(parseFloat(limitValue.text) + 0.25);
    }
  };

  var downButton = inputGroup.add("button", undefined, undefined, {
    name: "downButton",
  });
  downButton.helpTip = "Decrements of 0.25";
  downButton.text = "↓";
  downButton.preferredSize.width = 40;
  downButton.onClick = function () {
    if (isNaN(parseFloat(limitValue.text))) {
      limitValue.text = "12";
    } else {
      limitValue.text = String(parseFloat(limitValue.text) - 0.25);
    }
  };

  // BUTTONGROUP
  // ===========
  var buttonGroup = gui.add("group", undefined, { name: "buttonGroup" });
  buttonGroup.orientation = "row";
  buttonGroup.alignChildren = ["left", "center"];
  buttonGroup.spacing = 10;
  buttonGroup.margins = 0;

  // CANCEL
  var cancelButton = buttonGroup.add("button", undefined, "CANCEL", {
    name: "cancel",
  });
  cancelButton.onClick = function () {
    userValue = "EXIT";
    gui.close();
  };

  // OK
  var okButton = buttonGroup.add("button", undefined, "OK", { name: "ok" });
  okButton.onClick = function () {
    userValue = parseFloat(limitValue.text);

    if (userValue <= 0) {
      alert("Value must be greater than 0.");
    }

    if (isNaN(userValue)) {
      alert("Value must be a number.");
    }

    if (!isNaN(userValue) && userValue > 0) {
      gui.close();
    }
  };

  // Show Window
  gui.show();

  return userValue;
}

// *****************************
// EXECUTION LOGIC
// *****************************
function DTF_VariablePers(USER_VALUE) {
  // Exit if input window canceled
  if (USER_VALUE === "EXIT") return;

  // Set up & load settings
  var settingsFile = setupSettingsFile(
    "CMT_Seps_Settings",
    "Settings_Config.json",
  );
  var settingsData = loadJSONData(settingsFile);
  var templateDocPath = settingsData.DTF_templatePath;

  // Pers Data Document
  var dataDoc = app.activeDocument;

  // Exit if no Dataset is loaded
  if (!dataDoc.dataSets.length) {
    throw new Error(
      "No Variable Dataset Loaded" +
        "\n\n" +
        "Load A Dataset In the Variables Window",
    );
  }

  // Enable Preview Bounds
  app.preferences.setBooleanPreference("includeStrokeInBounds", true);

  // Create TEMP layer
  var tempLayer = dataDoc.layers.add();
  tempLayer.name = "TEMP";
  // Create OUTPUT layer
  var outputLayer = dataDoc.layers.add();
  outputLayer.name = "OUTPUT";

  // Target Pers layer
  var persLayer = dataDoc.layers.getByName("Pers");
  dataDoc.activeLayer = persLayer;

  // Deselect everything
  dataDoc.selection = null;

  // Loop through all available datasets
  for (var i = 0; i < dataDoc.dataSets.length; i++) {
    // Current dataset
    var currentDataSet = dataDoc.dataSets[i];

    // Display the dataset to update the canvas
    currentDataSet.display();

    // Update to ensure all dynamic elements (like visibility) refresh correctly
    currentDataSet.update();

    // PERS layer active
    dataDoc.activeLayer = persLayer;

    // Create copy of dataset & move to TEMP layer
    persLayer.hasSelectedArtwork = true;
    app.copy();
    dataDoc.selection = null;
    dataDoc.activeLayer = tempLayer;
    app.paste();
    dataDoc.selection = null;

    // TEMP text frames
    var currName = tempLayer.textFrames.getByName("_NAME");
    var currNumber = tempLayer.textFrames.getByName("_NUMBER");

    // NAME
    if (currName.contents.length > 0) {
      dataDoc.selection = null;
      currName.selected = true;
      app.executeMenuCommand("outline");
      dataDoc.selection[0].name = "_NAME_" + String(i);

      // Resize NAME to input width
      if (dataDoc.selection[0].width > USER_VALUE * 72) {
        dataDoc.selection[0].width = USER_VALUE * 72;
      }

      // Deselect everything
      dataDoc.selection = null;
    } else {
      currName.remove();
    }

    // NUMBER
    if (currNumber.contents.length > 0) {
      dataDoc.selection = null;
      currNumber.selected = true;
      app.executeMenuCommand("outline");
      tempLayer.groupItems[1].selected = true;
      dataDoc.selection[0].name = "_NUMBER_" + String(i);
      dataDoc.selection = null;
    } else {
      currNumber.remove();
    }

    // Group if name & number
    tempLayer.hasSelectedArtwork = true;

    // Center NAME & NUMBER to eachother, group & rename
    if (tempLayer.groupItems.length > 1) {
      var theName = tempLayer.groupItems.getByName("_NAME_" + String(i));
      var theNum = tempLayer.groupItems.getByName("_NUMBER_" + String(i));
      var nameCenterX = theName.left + theName.width / 2;
      var numCenterX = theNum.left + theNum.width / 2;
      var deltaX = nameCenterX - numCenterX;

      theNum.translate(deltaX, 0);
      tempLayer.hasSelectedArtwork = true;
      app.executeMenuCommand("group");
      dataDoc.selection[0].name = "_NN_" + String(i);
    }

    // Move to OUTPUT & clear items from TEMP layer
    dataDoc.selection = null;
    tempLayer.groupItems[0].selected = true;
    var tempSel = dataDoc.selection[0];
    tempSel.move(outputLayer, ElementPlacement.PLACEATEND);
    dataDoc.selection = null;
    tempLayer.pageItems.removeAll();
  }

  // Copy outlined datasets, delete TEMP & OUTPUT layers
  outputLayer.hasSelectedArtwork = true;
  app.cut();
  tempLayer.remove();
  outputLayer.remove();

  // Open DTF Template
  app.open(new File(templateDocPath));
  var templateDoc = app.activeDocument;

  // Target art layer & paste in template
  var artLayer = templateDoc.layers.getByName("Art");
  templateDoc.activeLayer = artLayer;
  app.paste();

  // Deselect, redraw catch-up hack, select & outline any strokes
  templateDoc.selection = null;
  app.redraw();
  artLayer.hasSelectedArtwork = true;
  app.executeMenuCommand("expandStyle");
  app.executeMenuCommand("OffsetPath v22");
  templateDoc.selection = null;
}

// *****************************
// RUN
// *****************************
try {
  if (
    app.documents.length > 0 &&
    app.activeDocument.artboards[0].name === "PERS_Template"
  ) {
    var userInputValue = DTF_VariablePers_InputWindow();
    DTF_VariablePers(userInputValue);
  } else {
    throw new Error("No Document Active");
  }
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
}
