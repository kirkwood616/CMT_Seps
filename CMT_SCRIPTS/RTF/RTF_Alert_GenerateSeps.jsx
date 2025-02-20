function RTF_Alert_GenerateSeps() {
  // Generate Seps Info
  alert(
    "Generate Seps Info" +
      "\n" +
      "The main functions of auto separating and populating Metadata for the art file." +
      "\n\n" +
      "This is the most involved and important step in auto generation." +
      "\n\n" +
      "Please make sure you have executed all previous actions in order before proceeding."
  );

  // Set Color Order, Mesh & Meta
  alert(
    "Set Color Order, Mesh & Meta" +
      "\n" +
      "Trims artwork, deletes no color paths, sets to Overprint Fill, and groups by color." +
      "\n\n" +
      "Prompt window will then appear. The left column indicates the color number/position." +
      "\n\n" +
      "Center column has dropdowns for selecting the color for the position." +
      "\n\n" +
      "Right column has dropdowns for selecting the mesh count for the color." +
      "\n\n" +
      "Renames color groups with input, sorts by position, creates a solid united shape for the last color, and generates all of the Metadata."
  );

  // Stroke Colors
  alert(
    "Stroke Colors" +
      "\n" +
      "Prompt will appear to select colors you wish to apply a stroke to." +
      "\n\n" +
      "Check the box next to the color you wish to stroke." +
      "\n\n" +
      "All colors that are NOT the last color will receive a 0.35 stroke." +
      "\n\n" +
      "If checked, the very last color will receive a 0.25 stroke" +
      "\n\n" +
      "Adjust manually if stroke weight changes are required."
  );
}

// Run
try {
  RTF_Alert_GenerateSeps();
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
}
