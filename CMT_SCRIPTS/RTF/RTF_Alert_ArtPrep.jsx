function RTF_Alert_ArtPrep() {
  // Art Prep Info
  alert(
    "RTF Art Prep Info" +
      "\n" +
      "These actions will help to clean up and identify potential problems or mistakes in the artwork." +
      "\n\n" +
      "Run these actions in the order they are listed." +
      "\n\n" +
      "Failing to run these steps can make the steps later in the process fail, have undesired results or innacurate separation info."
  );

  // Delete Hidden Paths
  alert("Delete Hidden Paths" + "\n" + "Remove any paths that are hidden/not visible within the pasted artwork.");

  // Delete No Color Paths
  alert("Delete No Color Paths" + "\n" + "Deletes any paths with a fill of [None]");

  // Convert CMYK Swatches
  alert(
    "Convert CMYK Swatches" +
      "\n" +
      "Converts any Process Color found in the swatch panel to a Spot Color." +
      "\n\n" +
      "Any paths that were previously colored with the Process swatch will be changed to the Spot swatch."
  );

  // CMYK No Swatch Check
  alert(
    "CMYK No Swatch Check" +
      "\n" +
      "Check for any CMYK/Process colors in the artwork without a swatch." +
      "\n\n" +
      "If present, it will create a Spot Swatch beginning with the name 'PROCESS SWATCH' in the Swatch panel, as well as recolor the paths to that Spot color." +
      "\n\n" +
      "Either rename the 'PROCESS SWATCH' to keep it in the artwork, or run the next action 'Delete Converted CMYK Swatches' to delete the swatch and paths."
  );

  // Delete Converted CMYK Swatches
  alert(
    "Delete Converted CMYK Swatches" +
      "\n" +
      "Deletes all Swatches beginning with the name 'PROCESS COLOR', as well as any paths colored with that swatch."
  );

  // Delete Unused Swatches
  alert(
    "Delete Converted CMYK Swatches" +
      "\n" +
      "Deletes all unused swatches." +
      "\n\n" +
      "If unused swatches are found, a prompt will appear asking you to confirm your choice." +
      "\n\n" +
      "If no unused swatches are found, nothing will appear."
  );

  // Check Opacity < 100%
  alert(
    "Check Opacity < 100%" +
      "\n" +
      "Finds and selects any items with less than 100% opacity." +
      "\n\n" +
      "Opacity can be changed via the Transparency Window."
  );

  // Check Color Tints < 100%
  alert(
    "Check Color Tints < 100%" +
      "\n" +
      "Finds and selects any items with less than 100% color tint." +
      "\n\n" +
      "Color tint can be changed via the Color Window."
  );
}

// Run
try {
  RTF_Alert_ArtPrep();
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
}
