function RTF_Alert_RTFInfo() {
  // Window
  var dialog = new Window("dialog", "CMT - RTF Actions Info");

  // Panel wrapper
  var panel = dialog.add("panel", undefined);

  // Text Group
  var textGroup = panel.add("group");
  textGroup.orientation = "column";

  // Text
  var text = textGroup.add(
    "statictext",
    undefined,
    "These actions are for use only within the RTF Template." +
      "\n\n" +
      "Only the 'Open Template' action will work when ran from another file." +
      "\n\n" +
      "Artwork used in this template and with these actions should be trimmed prior to pasting." +
      "\n\n" +
      "Run these actions in the order they are listed." +
      "\n\n" +
      "Failing to run actions in order can make later actions in the process fail, have undesired results or produce innacurate results." +
      "\n\n" +
      "Any consistent errors you experience should be reported to Mark Kirkwood, or an Issue should be submitted at the link below.",
    { multiline: true }
  );
  text.minimumSize = [350, 0];
  text.maximumSize = [350, 275];

  // Github link
  var link = textGroup.add("statictext", undefined, "https://github.com/kirkwood616/CMT_Seps");
  link.addEventListener("mousedown", function () {
    openURL("https://github.com/kirkwood616/CMT_Seps");
  });

  // OK button
  var okButton = dialog.add("button", undefined, "OK", { name: "ok" });

  // Show window
  dialog.show();
}

// Run
try {
  RTF_Alert_RTFInfo();
} catch (e) {
  alert(e, "Script Alert", true);
}

//*******************
// Helper functions
//*******************

function openURL(url) {
  var html = new File(Folder.temp.absoluteURI + "/aisLink.html");
  html.open("w");
  var htmlBody = '<html><head><META HTTP-EQUIV=Refresh CONTENT="0; URL=' + url + '"></head><body> <p></body></html>';
  html.write(htmlBody);
  html.close();
  html.execute();
}
