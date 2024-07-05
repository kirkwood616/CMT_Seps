function RTF_Alert_FirstSteps() {
  // First Steps Info
  alert(
    "RTF First Steps Info" +
      "\n" +
      "First steps of the automation process." +
      "\n\n" +
      "Do not skip these steps, especially 'Order & Art Info' and 'Paste Art'."
  );

  // Open Template
  alert(
    "Open Template" +
      "\n" +
      "Automatically open the RTF Template in a new window." +
      "\n\n" +
      "This can only be ran when a document is open or an error will be displayed." +
      "\n\n" +
      "You must edit the 'RTF_Open_Template.jsx' file and change the file path to where you have your template file located." +
      "\n\n" +
      "Editing this file can be done in a text editor (i.e. TextEdit or Notepad)."
  );

  // Order & Art Info
  alert(
    "Order & Art Info" +
      "\n" +
      "Prompts for the order & art number." +
      "\n\n" +
      "This info will be placed info the Metadata layer and the art number will be used to automatically save a file later in the process." +
      "\n\n" +
      "Input is not case sensitive. All input will be capitalized."
  );

  // Paste Art
  alert(
    "Paste Art" +
      "\n" +
      "Pastes the copied artwork 0.50 inches from the top registration and centered to artboard" +
      "\n\n" +
      "Ungroups everything in the pasted artwork. This is necessary for the next steps in the process." +
      "\n\n" +
      "Artwork should be trimmed prior to running this action."
  );
}

// Run
try {
  RTF_Alert_FirstSteps();
} catch (e) {
  alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
}
