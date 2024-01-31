function SP_PageProof_Open_Template() {
  // File path to the template document.
  // Update path to where you keep the template on your machine.
  var filePath = "~/Desktop/PAGE_PROOF.ait";

  // Open template document
  app.open(new File(filePath));
}

// Run
try {
  SP_PageProof_Open_Template();
} catch (e) {
  alert(e, "Script Alert", true);
}
