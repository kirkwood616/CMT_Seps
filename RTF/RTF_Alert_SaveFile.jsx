function RTF_Alert_SaveFile() {
  // Save File Info
  alert(
    "Save File Info" +
      "\n" +
      "Automatically saves a file using the art number in the format of" +
      "\n" +
      "'24-MK-1234sc (RTF).ai'" +
      "\n\n" +
      "An alert window will appear confirming the file was saved in that format if successful. If unsuccessful, an alert window with an error message will appear." +
      "\n\n" +
      "You must edit the 'RTF_SaveFile.jsx' file and change the file path to the directory you would like your document saved to." +
      "\n\n" +
      "Editing this file can be done in a text editor (i.e. TextEdit or Notepad)."
  );
}

// Run
try {
  RTF_Alert_SaveFile();
} catch (e) {
  alert(e, "Script Alert", true);
}
