function SP_Open_Template() {
  // File path to the template document.
  // Update path to where you keep the template on your machine.
  var filePath = "~/Desktop/Quick Crosshairs.ait";

  // Open template document
  app.open(new File(filePath));
}

// Run
try {
  SP_Open_Template();
} catch (e) {
  alert(e, "Script Alert", true);
}
