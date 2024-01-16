function RTF_Alert_GenerateLayout() {
  // Generate Layout Info
  alert(
    "Generate Layout Info" +
      "\n" +
      "Automatically duplicates art and arranges it in a layout to maximize usuable space." +
      "\n\n" +
      "Art must be in a single group on the 'Transfer Art' layer before running this action." +
      "\n\n" +
      "Generated layout will be grouped and centered on the artboard." +
      "\n\n" +
      "Art will have a minimum of 0.25 inch margin between the registration marks and the layout, and 0.50 inch margin between duplicates."
  );
}

// Run
try {
  RTF_Alert_GenerateLayout();
} catch (e) {
  alert(e, "Script Alert", true);
}
